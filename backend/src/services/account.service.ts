import prisma from '../config/db';
import { z } from 'zod';
import { createAccountSchema, updateAccountSchema } from '../validators/account.validator';
import { CustomError } from '../middleware/error.middleware';

export class AccountService {
  static async create(tenantId: string, data: z.infer<typeof createAccountSchema>) {
    return prisma.account.create({
      data: {
        ...data,
        tenantId
      }
    });
  }

  static async list(tenantId: string) {
    // Dynamic balance calculation is done by aggregating ledger entries
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
        // CREDIT adds to balance, DEBIT subtracts from balance
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

  static async update(tenantId: string, id: string, data: z.infer<typeof updateAccountSchema>) {
    // Check isolation
    const existing = await prisma.account.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      const error: CustomError = new Error('Account not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.account.update({
      where: { id },
      data
    });
  }

  static async delete(tenantId: string, id: string) {
    const existing = await prisma.account.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      const error: CustomError = new Error('Account not found');
      error.statusCode = 404;
      throw error;
    }

    // Ensure no transactions exist
    const txCount = await prisma.transaction.count({ where: { accountId: id } });
    if (txCount > 0) {
       const error: CustomError = new Error('Cannot delete account with existing transactions');
       error.statusCode = 400;
       throw error;
    }

    await prisma.account.delete({ where: { id } });
    return { success: true };
  }
}
