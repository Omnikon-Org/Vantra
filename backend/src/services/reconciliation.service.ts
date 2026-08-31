import prisma from '../config/db';
import { z } from 'zod';
import {
  runReconciliationSchema,
  manualMatchSchema,
  resolveDiscrepancySchema
} from '../validators/reconciliation.validator';
import { CustomError } from '../middleware/error.middleware';
import { Prisma } from '@prisma/client';
import { AuditService } from './audit.service';

export class ReconciliationService {
  static async run(tenantId: string, data: z.infer<typeof runReconciliationSchema>, userId?: string) {
    // 1. Verify account belongs to tenant
    const account = await prisma.account.findUnique({
      where: { id: data.accountId }
    });

    if (!account || account.tenantId !== tenantId) {
      const error: CustomError = new Error('Invalid account');
      error.statusCode = 404;
      throw error;
    }

    // 2. Fetch internal transactions for the account
    const whereClause: Prisma.TransactionWhereInput = {
      tenantId,
      accountId: data.accountId
    };

    if (data.startDate || data.endDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (data.startDate) dateFilter.gte = new Date(data.startDate);
      if (data.endDate) dateFilter.lte = new Date(data.endDate);
      whereClause.transactionAt = dateFilter;
    }

    const internalTransactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: { select: { id: true, name: true } },
        merchant: { select: { id: true, name: true } }
      }
    });

    const dateToleranceDays = data.rules?.dateToleranceDays ?? 3;
    const autoReconcile = data.rules?.autoReconcileTransactions ?? true;

    // 3. Multi-Pass Matching Algorithm
    let unmatchedInternal = [...internalTransactions];
    let unmatchedExternal = data.externalRecords.map((rec, index) => ({
      ...rec,
      originalIndex: index
    }));

    interface ItemData {
      transactionId: string | null;
      externalReference: string | null;
      externalAmount: Prisma.Decimal | number | null;
      externalDate: Date | null;
      externalDescription: string | null;
      internalAmount: Prisma.Decimal | number | null;
      matchType: string;
      status: string;
      discrepancyReason: string | null;
      discrepancyAmount: number | null;
      confidenceScore: number | null;
    }

    const itemsToCreate: ItemData[] = [];
    const matchedTxIdsToUpdate: string[] = [];

    // PASS 1: Exact Reference Match
    const remainingExternalAfterP1: typeof unmatchedExternal = [];
    for (const ext of unmatchedExternal) {
      if (ext.reference) {
        const txIndex = unmatchedInternal.findIndex(
          (tx) => tx.reference && tx.reference.toLowerCase() === ext.reference!.toLowerCase()
        );

        if (txIndex !== -1) {
          const tx = unmatchedInternal[txIndex];
          unmatchedInternal.splice(txIndex, 1);

          const extAmt = Number(ext.amount);
          const intAmt = Number(tx.amount);
          const diff = Math.abs(extAmt - intAmt);

          if (diff < 0.001) {
            itemsToCreate.push({
              transactionId: tx.id,
              externalReference: ext.reference,
              externalAmount: ext.amount,
              externalDate: ext.date ? new Date(ext.date) : null,
              externalDescription: ext.description || null,
              internalAmount: tx.amount,
              matchType: 'EXACT',
              status: 'MATCHED',
              discrepancyReason: null,
              discrepancyAmount: 0,
              confidenceScore: 1.0
            });
            matchedTxIdsToUpdate.push(tx.id);
          } else {
            itemsToCreate.push({
              transactionId: tx.id,
              externalReference: ext.reference,
              externalAmount: ext.amount,
              externalDate: ext.date ? new Date(ext.date) : null,
              externalDescription: ext.description || null,
              internalAmount: tx.amount,
              matchType: 'DISCREPANCY',
              status: 'DISCREPANT',
              discrepancyReason: `Amount mismatch for reference '${ext.reference}': external record is ${extAmt.toFixed(2)} ${ext.currency || 'USD'} but internal record is ${intAmt.toFixed(2)} ${tx.currency} (difference of ${diff.toFixed(2)})`,
              discrepancyAmount: diff,
              confidenceScore: 0.6
            });
          }
          continue;
        }
      }
      remainingExternalAfterP1.push(ext);
    }
    unmatchedExternal = remainingExternalAfterP1;

    // PASS 2: Exact Amount + Exact Date (Same Calendar Day) Match
    const remainingExternalAfterP2: typeof unmatchedExternal = [];
    for (const ext of unmatchedExternal) {
      const extAmt = Number(ext.amount);
      const extDate = ext.date ? new Date(ext.date) : null;

      const txIndex = unmatchedInternal.findIndex((tx) => {
        const intAmt = Number(tx.amount);
        if (Math.abs(intAmt - extAmt) >= 0.001) return false;
        if (ext.currency && tx.currency !== ext.currency) return false;

        if (extDate) {
          const txDate = new Date(tx.transactionAt);
          return (
            txDate.getUTCFullYear() === extDate.getUTCFullYear() &&
            txDate.getUTCMonth() === extDate.getUTCMonth() &&
            txDate.getUTCDate() === extDate.getUTCDate()
          );
        }
        return true;
      });

      if (txIndex !== -1) {
        const tx = unmatchedInternal[txIndex];
        unmatchedInternal.splice(txIndex, 1);

        itemsToCreate.push({
          transactionId: tx.id,
          externalReference: ext.reference || null,
          externalAmount: ext.amount,
          externalDate: extDate,
          externalDescription: ext.description || null,
          internalAmount: tx.amount,
          matchType: 'EXACT',
          status: 'MATCHED',
          discrepancyReason: null,
          discrepancyAmount: 0,
          confidenceScore: 0.95
        });
        matchedTxIdsToUpdate.push(tx.id);
      } else {
        remainingExternalAfterP2.push(ext);
      }
    }
    unmatchedExternal = remainingExternalAfterP2;

    // PASS 3: Fuzzy Match (Amount + Date within Tolerance Window)
    const remainingExternalAfterP3: typeof unmatchedExternal = [];
    for (const ext of unmatchedExternal) {
      const extAmt = Number(ext.amount);
      const extDate = ext.date ? new Date(ext.date) : null;

      const txIndex = unmatchedInternal.findIndex((tx) => {
        const intAmt = Number(tx.amount);
        if (Math.abs(intAmt - extAmt) >= 0.001) return false;
        if (ext.currency && tx.currency !== ext.currency) return false;

        if (extDate) {
          const txDate = new Date(tx.transactionAt);
          const diffDays = Math.abs(txDate.getTime() - extDate.getTime()) / (1000 * 60 * 60 * 24);
          return diffDays <= dateToleranceDays;
        }
        return true;
      });

      if (txIndex !== -1) {
        const tx = unmatchedInternal[txIndex];
        unmatchedInternal.splice(txIndex, 1);

        const txDate = new Date(tx.transactionAt);
        const dayDiff = extDate
          ? Math.round(Math.abs(txDate.getTime() - extDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        itemsToCreate.push({
          transactionId: tx.id,
          externalReference: ext.reference || null,
          externalAmount: ext.amount,
          externalDate: extDate,
          externalDescription: ext.description || null,
          internalAmount: tx.amount,
          matchType: 'FUZZY',
          status: 'MATCHED',
          discrepancyReason: dayDiff > 0 ? `Matched with ${dayDiff} day(s) difference (within ${dateToleranceDays} day tolerance)` : null,
          discrepancyAmount: 0,
          confidenceScore: Math.max(0.7, 0.9 - dayDiff * 0.05)
        });
        matchedTxIdsToUpdate.push(tx.id);
      } else {
        remainingExternalAfterP3.push(ext);
      }
    }
    unmatchedExternal = remainingExternalAfterP3;

    // PASS 4: Description / Date Discrepancy
    const remainingExternalAfterP4: typeof unmatchedExternal = [];
    for (const ext of unmatchedExternal) {
      if (ext.description) {
        const extDesc = ext.description.toLowerCase().trim();
        const extDate = ext.date ? new Date(ext.date) : null;

        const txIndex = unmatchedInternal.findIndex((tx) => {
          if (!tx.description) return false;
          const intDesc = tx.description.toLowerCase().trim();
          const descMatches = intDesc.includes(extDesc) || extDesc.includes(intDesc);
          if (!descMatches) return false;

          if (extDate) {
            const txDate = new Date(tx.transactionAt);
            const diffDays = Math.abs(txDate.getTime() - extDate.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays <= dateToleranceDays;
          }
          return true;
        });

        if (txIndex !== -1) {
          const tx = unmatchedInternal[txIndex];
          unmatchedInternal.splice(txIndex, 1);

          const extAmt = Number(ext.amount);
          const intAmt = Number(tx.amount);
          const diff = Math.abs(extAmt - intAmt);

          itemsToCreate.push({
            transactionId: tx.id,
            externalReference: ext.reference || null,
            externalAmount: ext.amount,
            externalDate: extDate,
            externalDescription: ext.description,
            internalAmount: tx.amount,
            matchType: 'DISCREPANCY',
            status: 'DISCREPANT',
            discrepancyReason: `Description matched with amount difference: external is ${extAmt.toFixed(2)} vs internal ${intAmt.toFixed(2)} (difference of ${diff.toFixed(2)})`,
            discrepancyAmount: diff,
            confidenceScore: 0.5
          });
          continue;
        }
      }
      remainingExternalAfterP4.push(ext);
    }
    unmatchedExternal = remainingExternalAfterP4;

    // PASS 5: Unmatched Exceptions
    // 5a: Unmatched External records (Missing in internal system)
    for (const ext of unmatchedExternal) {
      itemsToCreate.push({
        transactionId: null,
        externalReference: ext.reference || null,
        externalAmount: ext.amount,
        externalDate: ext.date ? new Date(ext.date) : null,
        externalDescription: ext.description || null,
        internalAmount: null,
        matchType: 'UNMATCHED',
        status: 'UNMATCHED',
        discrepancyReason: 'External record not found in internal transactions',
        discrepancyAmount: Number(ext.amount),
        confidenceScore: 0
      });
    }

    // 5b: Unmatched Internal transactions (Missing in external records)
    for (const tx of unmatchedInternal) {
      itemsToCreate.push({
        transactionId: tx.id,
        externalReference: tx.reference || null,
        externalAmount: null,
        externalDate: null,
        externalDescription: null,
        internalAmount: tx.amount,
        matchType: 'UNMATCHED',
        status: 'UNMATCHED',
        discrepancyReason: 'Internal transaction not found in external statement records',
        discrepancyAmount: Number(tx.amount),
        confidenceScore: 0
      });
    }

    // Calculate Summary Statistics
    const matchedItems = itemsToCreate.filter((item) => item.status === 'MATCHED');
    const unmatchedItems = itemsToCreate.filter((item) => item.status === 'UNMATCHED');
    const discrepantItems = itemsToCreate.filter((item) => item.status === 'DISCREPANT');

    const matchedAmount = matchedItems.reduce(
      (sum, item) => sum + Number(item.internalAmount || item.externalAmount || 0),
      0
    );

    const discrepancyAmount = discrepantItems.reduce(
      (sum, item) => sum + (item.discrepancyAmount || 0),
      0
    );

    // Save in Database
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const reconciliation = await tx.reconciliation.create({
        data: {
          tenantId,
          accountId: data.accountId,
          status: 'COMPLETED',
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          totalInternal: internalTransactions.length,
          totalExternal: data.externalRecords.length,
          matchedCount: matchedItems.length,
          unmatchedCount: unmatchedItems.length,
          discrepancyCount: discrepantItems.length,
          matchedAmount: new Prisma.Decimal(matchedAmount),
          discrepancyAmount: new Prisma.Decimal(discrepancyAmount),
          notes: data.notes || null
        }
      });

      // Create Reconciliation Items & Automated Exception Records
      for (const item of itemsToCreate) {
        const createdItem = await tx.reconciliationItem.create({
          data: {
            tenantId,
            reconciliationId: reconciliation.id,
            transactionId: item.transactionId,
            externalReference: item.externalReference,
            externalAmount: item.externalAmount !== null ? new Prisma.Decimal(Number(item.externalAmount)) : null,
            externalDate: item.externalDate,
            externalDescription: item.externalDescription,
            internalAmount: item.internalAmount !== null ? new Prisma.Decimal(Number(item.internalAmount)) : null,
            matchType: item.matchType,
            status: item.status,
            discrepancyReason: item.discrepancyReason,
            discrepancyAmount: item.discrepancyAmount !== null ? new Prisma.Decimal(item.discrepancyAmount) : null,
            confidenceScore: item.confidenceScore !== null ? new Prisma.Decimal(item.confidenceScore) : null
          }
        });

        // If item is discrepant or unmatched, create ReconciliationException
        if (item.status === 'DISCREPANT' || item.status === 'UNMATCHED') {
          let exceptionType = 'AMOUNT_MISMATCH';
          if (item.matchType === 'UNMATCHED') {
            exceptionType = item.externalAmount !== null ? 'UNMATCHED_EXTERNAL' : 'UNMATCHED_INTERNAL';
          } else if (item.discrepancyReason?.includes('Description')) {
            exceptionType = 'DESCRIPTION_MISMATCH';
          }

          const amt = Number(item.discrepancyAmount || item.externalAmount || item.internalAmount || 0);
          let severity = 'LOW';
          if (amt >= 1000) severity = 'HIGH';
          else if (amt >= 100) severity = 'MEDIUM';

          await tx.reconciliationException.create({
            data: {
              tenantId,
              reconciliationId: reconciliation.id,
              reconciliationItemId: createdItem.id,
              transactionId: item.transactionId,
              exceptionType,
              severity,
              status: 'OPEN',
              description: item.discrepancyReason || 'Reconciliation discrepancy detected'
            }
          });
        }
      }

      // Auto update status on matched internal transactions
      if (autoReconcile && matchedTxIdsToUpdate.length > 0) {
        await tx.transaction.updateMany({
          where: {
            id: { in: matchedTxIdsToUpdate },
            tenantId
          },
          data: {
            status: 'RECONCILED'
          }
        });
      }

      // Record Audit Log
      await AuditService.log(
        {
          tenantId,
          userId,
          action: 'RECONCILIATION_CREATED',
          entityType: 'Reconciliation',
          entityId: reconciliation.id,
          metadata: {
            accountId: data.accountId,
            matchedCount: matchedItems.length,
            discrepancyCount: discrepantItems.length,
            unmatchedCount: unmatchedItems.length
          }
        },
        tx
      );

      // Return complete reconciliation record with items and relations
      return tx.reconciliation.findUnique({
        where: { id: reconciliation.id },
        include: {
          account: { select: { id: true, name: true, currency: true } },
          items: {
            include: {
              transaction: {
                select: {
                  id: true,
                  amount: true,
                  currency: true,
                  type: true,
                  status: true,
                  description: true,
                  reference: true,
                  transactionAt: true
                }
              }
            }
          }
        }
      });
    });
  }

  static async list(tenantId: string, query: Record<string, string | undefined>) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const skip = (page - 1) * limit;

    const where: Prisma.ReconciliationWhereInput = { tenantId };
    if (query.accountId) where.accountId = query.accountId;
    if (query.status) where.status = query.status;

    const [reconciliations, total] = await Promise.all([
      prisma.reconciliation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          account: { select: { id: true, name: true, currency: true } }
        }
      }),
      prisma.reconciliation.count({ where })
    ]);

    return { reconciliations, total, page, limit };
  }

  static async getById(tenantId: string, id: string) {
    const reconciliation = await prisma.reconciliation.findUnique({
      where: { id },
      include: {
        account: { select: { id: true, name: true, currency: true } },
        items: {
          orderBy: { createdAt: 'asc' },
          include: {
            transaction: {
              select: {
                id: true,
                amount: true,
                currency: true,
                type: true,
                status: true,
                description: true,
                reference: true,
                transactionAt: true
              }
            }
          }
        }
      }
    });

    if (!reconciliation || reconciliation.tenantId !== tenantId) {
      const error: CustomError = new Error('Reconciliation record not found');
      error.statusCode = 404;
      throw error;
    }

    return reconciliation;
  }

  static async manualMatch(
    tenantId: string,
    reconciliationId: string,
    data: z.infer<typeof manualMatchSchema>,
    userId?: string
  ) {
    const reconciliation = await prisma.reconciliation.findUnique({
      where: { id: reconciliationId }
    });

    if (!reconciliation || reconciliation.tenantId !== tenantId) {
      const error: CustomError = new Error('Reconciliation record not found');
      error.statusCode = 404;
      throw error;
    }

    const item = await prisma.reconciliationItem.findUnique({
      where: { id: data.reconciliationItemId }
    });

    if (!item || item.tenantId !== tenantId || item.reconciliationId !== reconciliationId) {
      const error: CustomError = new Error('Reconciliation item not found');
      error.statusCode = 404;
      throw error;
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: data.transactionId }
    });

    if (!transaction || transaction.tenantId !== tenantId) {
      const error: CustomError = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedItem = await tx.reconciliationItem.update({
        where: { id: data.reconciliationItemId },
        data: {
          transactionId: data.transactionId,
          internalAmount: transaction.amount,
          matchType: 'MANUAL',
          status: 'MATCHED',
          confidenceScore: new Prisma.Decimal(1.0),
          discrepancyReason: data.notes || 'Manually matched by user'
        }
      });

      await tx.transaction.update({
        where: { id: data.transactionId },
        data: { status: 'RECONCILED' }
      });

      // Also resolve associated exception if any exists
      await tx.reconciliationException.updateMany({
        where: {
          tenantId,
          reconciliationItemId: data.reconciliationItemId
        },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          resolvedById: userId || null,
          resolutionNotes: data.notes || 'Manually matched'
        }
      });

      // Recalculate summary metrics on reconciliation
      const allItems = await tx.reconciliationItem.findMany({
        where: { reconciliationId }
      });

      const matchedCount = allItems.filter((i) => i.status === 'MATCHED').length;
      const unmatchedCount = allItems.filter((i) => i.status === 'UNMATCHED').length;
      const discrepancyCount = allItems.filter((i) => i.status === 'DISCREPANT').length;

      await tx.reconciliation.update({
        where: { id: reconciliationId },
        data: {
          matchedCount,
          unmatchedCount,
          discrepancyCount
        }
      });

      await AuditService.log(
        {
          tenantId,
          userId,
          action: 'RECONCILIATION_MANUAL_MATCH',
          entityType: 'ReconciliationItem',
          entityId: data.reconciliationItemId,
          metadata: {
            reconciliationId,
            transactionId: data.transactionId,
            notes: data.notes || null
          }
        },
        tx
      );

      return updatedItem;
    });
  }

  static async resolveDiscrepancy(
    tenantId: string,
    reconciliationId: string,
    data: z.infer<typeof resolveDiscrepancySchema>,
    userId?: string
  ) {
    const reconciliation = await prisma.reconciliation.findUnique({
      where: { id: reconciliationId }
    });

    if (!reconciliation || reconciliation.tenantId !== tenantId) {
      const error: CustomError = new Error('Reconciliation record not found');
      error.statusCode = 404;
      throw error;
    }

    const item = await prisma.reconciliationItem.findUnique({
      where: { id: data.itemId }
    });

    if (!item || item.tenantId !== tenantId || item.reconciliationId !== reconciliationId) {
      const error: CustomError = new Error('Reconciliation item not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedItem = await tx.reconciliationItem.update({
        where: { id: data.itemId },
        data: {
          status: 'RESOLVED',
          discrepancyReason: `Resolved (${data.resolution}): ${data.notes || 'No notes provided'}`
        }
      });

      // Also resolve associated exception if any exists
      await tx.reconciliationException.updateMany({
        where: {
          tenantId,
          reconciliationItemId: data.itemId
        },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          resolvedById: userId || null,
          resolutionNotes: `Resolved (${data.resolution}): ${data.notes || 'No notes provided'}`
        }
      });

      // Recalculate summary metrics
      const allItems = await tx.reconciliationItem.findMany({
        where: { reconciliationId }
      });

      const matchedCount = allItems.filter((i) => i.status === 'MATCHED').length;
      const unmatchedCount = allItems.filter((i) => i.status === 'UNMATCHED').length;
      const discrepancyCount = allItems.filter((i) => i.status === 'DISCREPANT').length;

      await tx.reconciliation.update({
        where: { id: reconciliationId },
        data: {
          matchedCount,
          unmatchedCount,
          discrepancyCount
        }
      });

      await AuditService.log(
        {
          tenantId,
          userId,
          action: 'RECONCILIATION_DISCREPANCY_RESOLVED',
          entityType: 'ReconciliationItem',
          entityId: data.itemId,
          metadata: {
            reconciliationId,
            resolution: data.resolution,
            notes: data.notes || null
          }
        },
        tx
      );

      return updatedItem;
    });
  }

  static async delete(tenantId: string, id: string, userId?: string) {
    const existing = await prisma.reconciliation.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      const error: CustomError = new Error('Reconciliation record not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.reconciliation.delete({ where: { id } });

      await AuditService.log(
        {
          tenantId,
          userId,
          action: 'RECONCILIATION_DELETED',
          entityType: 'Reconciliation',
          entityId: id,
          metadata: { accountId: existing.accountId }
        },
        tx
      );

      return { success: true, message: 'Reconciliation record deleted' };
    });
  }
}

