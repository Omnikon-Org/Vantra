import prisma from '../config/db';
import { z } from 'zod';
import { createAccountSchema, updateAccountSchema } from '../validators/account.validator';
import { CustomError } from '../middleware/error.middleware';
import { AuditService } from './audit.service';
import { Prisma } from '@prisma/client';

export class AccountService {
  static async create(tenantId: string, data: z.infer<typeof createAccountSchema>, userId?: string) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const account = await tx.account.create({
        data: {
          ...data,
          tenantId
        }
      });

      await AuditService.log(
        {
          tenantId,
          userId,
          action: 'ACCOUNT_CREATED',
          entityType: 'Account',
          entityId: account.id,
          metadata: { name: account.name, type: account.type, currency: account.currency }
        },
        tx
      );

      return account;
    });
  }

  static async list(tenantId: string) {
    const accounts = await prisma.account.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: {
        ledgerEntries: {
          select: {
            amount: true,
            entryType: true
          }
        }
      }
    });

    return accounts.map(acc => {
      let balance = 0;
      acc.ledgerEntries.forEach(entry => {
        if (entry.entryType === 'CREDIT') {
          balance += Number(entry.amount);
        } else if (entry.entryType === 'DEBIT') {
          balance -= Number(entry.amount);
        }
      });

      const { ledgerEntries, ...rest } = acc;
      return { ...rest, balance };
    });
  }

  static async getById(tenantId: string, id: string) {
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        ledgerEntries: {
          select: {
            amount: true,
            entryType: true
          }
        }
      }
    });

    if (!account || account.tenantId !== tenantId) {
      const error: CustomError = new Error('Account not found');
      error.statusCode = 404;
      throw error;
    }

    let balance = 0;
    account.ledgerEntries.forEach(entry => {
      if (entry.entryType === 'CREDIT') {
        balance += Number(entry.amount);
      } else if (entry.entryType === 'DEBIT') {
        balance -= Number(entry.amount);
      }
    });

    const { ledgerEntries, ...rest } = account;
    return { ...rest, balance };
  }

  static async update(tenantId: string, id: string, data: z.infer<typeof updateAccountSchema>, userId?: string) {
    const existing = await prisma.account.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      const error: CustomError = new Error('Account not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.account.update({
        where: { id },
        data
      });

      await AuditService.log(
        {
          tenantId,
          userId,
          action: 'ACCOUNT_UPDATED',
          entityType: 'Account',
          entityId: id,
          metadata: { changes: data }
        },
        tx
      );

      return updated;
    });
  }

  static async delete(tenantId: string, id: string, userId?: string) {
    const existing = await prisma.account.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      const error: CustomError = new Error('Account not found');
      error.statusCode = 404;
      throw error;
    }

    const txCount = await prisma.transaction.count({ where: { accountId: id } });
    if (txCount > 0) {
       const error: CustomError = new Error('Cannot delete account with existing transactions');
       error.statusCode = 400;
       throw error;
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.account.delete({ where: { id } });

      await AuditService.log(
        {
          tenantId,
          userId,
          action: 'ACCOUNT_DELETED',
          entityType: 'Account',
          entityId: id,
          metadata: { name: existing.name }
        },
        tx
      );

      return { success: true };
    });
  }
}
