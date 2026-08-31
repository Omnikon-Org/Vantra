import prisma from '../config/db';
import { Prisma } from '@prisma/client';

export interface AuditLogParams {
  tenantId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
}

export class AuditService {
  private static sanitizeMetadata(metadata?: Record<string, any> | null): Record<string, any> | null {
    if (!metadata) return null;
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'jwt', 'authorization', 'apiKey'];
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (sensitiveKeys.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeMetadata(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  static async log(params: AuditLogParams, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const sanitizedMetadata = this.sanitizeMetadata(params.metadata);

    return client.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        metadata: sanitizedMetadata ?? Prisma.DbNull
      }
    });
  }

  static async list(tenantId: string, query: Record<string, string | undefined>) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = { tenantId };

    if (query.action) where.action = query.action;
    if (query.entityType) where.entityType = query.entityType;

    if (query.startDate || query.endDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (query.startDate) dateFilter.gte = new Date(query.startDate);
      if (query.endDate) dateFilter.lte = new Date(query.endDate);
      where.createdAt = dateFilter;
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    return { auditLogs, total, page, limit };
  }
}
