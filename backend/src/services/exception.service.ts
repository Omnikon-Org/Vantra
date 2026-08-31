import prisma from '../config/db';
import { Prisma } from '@prisma/client';
import { CustomError } from '../middleware/error.middleware';
import { AuditService } from './audit.service';

export class ExceptionService {
  static async list(tenantId: string, query: Record<string, string | undefined>) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const skip = (page - 1) * limit;

    const where: Prisma.ReconciliationExceptionWhereInput = { tenantId };

    if (query.status) where.status = query.status;
    if (query.severity) where.severity = query.severity;
    if (query.exceptionType) where.exceptionType = query.exceptionType;
    if (query.reconciliationId) where.reconciliationId = query.reconciliationId;

    if (query.startDate || query.endDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (query.startDate) dateFilter.gte = new Date(query.startDate);
      if (query.endDate) dateFilter.lte = new Date(query.endDate);
      where.createdAt = dateFilter;
    }

    const [exceptions, total] = await Promise.all([
      prisma.reconciliationException.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reconciliation: {
            select: { id: true, accountId: true, status: true }
          },
          transaction: {
            select: {
              id: true,
              amount: true,
              currency: true,
              reference: true,
              description: true
            }
          },
          resolvedBy: {
            select: { id: true, email: true, name: true }
          }
        }
      }),
      prisma.reconciliationException.count({ where })
    ]);

    return { exceptions, total, page, limit };
  }

  static async getById(tenantId: string, id: string) {
    const exception = await prisma.reconciliationException.findUnique({
      where: { id },
      include: {
        reconciliation: {
          select: { id: true, accountId: true, status: true, startDate: true, endDate: true }
        },
        reconciliationItem: true,
        transaction: {
          select: {
            id: true,
            amount: true,
            currency: true,
            type: true,
            reference: true,
            description: true,
            status: true
          }
        },
        resolvedBy: {
          select: { id: true, email: true, name: true, role: true }
        }
      }
    });

    if (!exception || exception.tenantId !== tenantId) {
      const error: CustomError = new Error('Exception record not found');
      error.statusCode = 404;
      throw error;
    }

    return exception;
  }

  static async updateStatus(
    tenantId: string,
    userId: string,
    id: string,
    status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED',
    notes?: string
  ) {
    const existing = await prisma.reconciliationException.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      const error: CustomError = new Error('Exception record not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const isResolving = status === 'RESOLVED';
      const updated = await tx.reconciliationException.update({
        where: { id },
        data: {
          status,
          resolutionNotes: notes || existing.resolutionNotes,
          resolvedAt: isResolving ? new Date() : (status === 'OPEN' ? null : existing.resolvedAt),
          resolvedById: isResolving ? userId : (status === 'OPEN' ? null : existing.resolvedById)
        },
        include: {
          resolvedBy: { select: { id: true, email: true, name: true } }
        }
      });

      if (isResolving && existing.reconciliationItemId) {
        await tx.reconciliationItem.update({
          where: { id: existing.reconciliationItemId },
          data: {
            status: 'RESOLVED',
            discrepancyReason: notes ? `Resolved: ${notes}` : 'Resolved via exception management'
          }
        });
      }

      await AuditService.log(
        {
          tenantId,
          userId,
          action: isResolving ? 'EXCEPTION_RESOLVED' : 'EXCEPTION_STATUS_UPDATED',
          entityType: 'ReconciliationException',
          entityId: id,
          metadata: {
            previousStatus: existing.status,
            newStatus: status,
            notes: notes || null
          }
        },
        tx
      );

      return updated;
    });
  }

  static async resolve(
    tenantId: string,
    userId: string,
    id: string,
    data: { resolutionNotes: string }
  ) {
    return this.updateStatus(tenantId, userId, id, 'RESOLVED', data.resolutionNotes);
  }
}
