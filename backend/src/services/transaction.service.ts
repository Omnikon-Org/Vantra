import prisma from '../config/db';
import { z } from 'zod';
import { createTransactionSchema, updateTransactionSchema } from '../validators/transaction.validator';
import { CustomError } from '../middleware/error.middleware';
import { Prisma } from '@prisma/client';
import { AuditService } from './audit.service';

export class TransactionService {
  static async create(tenantId: string, data: z.infer<typeof createTransactionSchema>, userId?: string) {
    // 1. Verify account belongs to tenant
    const account = await prisma.account.findUnique({ where: { id: data.accountId } });
    if (!account || account.tenantId !== tenantId) {
      const error: CustomError = new Error('Invalid account');
      error.statusCode = 400;
      throw error;
    }

    // 2. Map type to ledger entry type (Income = CREDIT to account, Expense = DEBIT to account)
    const entryType = data.type === 'INCOME' ? 'CREDIT' : 'DEBIT';

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const transaction = await tx.transaction.create({
        data: {
          tenantId,
          accountId: data.accountId,
          categoryId: data.categoryId,
          merchantId: data.merchantId,
          amount: data.amount,
          currency: data.currency,
          type: data.type,
          description: data.description,
          transactionAt: data.transactionAt ? new Date(data.transactionAt) : new Date()
        }
      });

      await tx.ledgerEntry.create({
        data: {
          tenantId,
          accountId: data.accountId,
          transactionId: transaction.id,
          amount: data.amount,
          currency: data.currency,
          entryType
        }
      });

      await AuditService.log(
        {
          tenantId,
          userId,
          action: 'TRANSACTION_CREATED',
          entityType: 'Transaction',
          entityId: transaction.id,
          metadata: {
            accountId: data.accountId,
            amount: data.amount,
            type: data.type,
            currency: data.currency,
            description: data.description
          }
        },
        tx
      );

      return transaction;
    });
  }

  static async list(tenantId: string, query: Record<string, string | undefined>) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = { tenantId };

    if (query.accountId) where.accountId = query.accountId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.type) where.type = query.type;
    
    if (query.startDate || query.endDate) {
      const transactionAtFilter: Prisma.DateTimeFilter = {};
      if (query.startDate) transactionAtFilter.gte = new Date(query.startDate);
      if (query.endDate) transactionAtFilter.lte = new Date(query.endDate);
      where.transactionAt = transactionAtFilter;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { transactionAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          merchant: { select: { id: true, name: true } }
        }
      }),
      prisma.transaction.count({ where })
    ]);

    return { transactions, total, page, limit };
  }

  static async getById(tenantId: string, id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        merchant: { select: { id: true, name: true } },
        ledgerEntries: true
      }
    });

    if (!transaction || transaction.tenantId !== tenantId) {
      const error: CustomError = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    return transaction;
  }

  static async update(tenantId: string, id: string, data: z.infer<typeof updateTransactionSchema>, userId?: string) {
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      const error: CustomError = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.transaction.update({
        where: { id },
        data
      });

      await AuditService.log(
        {
          tenantId,
          userId,
          action: 'TRANSACTION_UPDATED',
          entityType: 'Transaction',
          entityId: id,
          metadata: { changes: data }
        },
        tx
      );

      return updated;
    });
  }

  static async delete(tenantId: string, id: string, userId?: string) {
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      const error: CustomError = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.ledgerEntry.deleteMany({ where: { transactionId: id } });
      await tx.transaction.delete({ where: { id } });

      await AuditService.log(
        {
          tenantId,
          userId,
          action: 'TRANSACTION_DELETED',
          entityType: 'Transaction',
          entityId: id,
          metadata: { amount: Number(existing.amount), description: existing.description }
        },
        tx
      );

      return { success: true };
    });
  }
}
