import { z } from 'zod';

export const externalRecordSchema = z.object({
  reference: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('USD').optional(),
  date: z.string().datetime().optional(),
  description: z.string().optional()
});

export const runReconciliationSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  externalRecords: z.array(externalRecordSchema).min(0).default([]),
  rules: z.object({
    dateToleranceDays: z.number().int().min(0).max(30).default(3).optional(),
    autoReconcileTransactions: z.boolean().default(true).optional()
  }).optional(),
  notes: z.string().optional()
});

export const manualMatchSchema = z.object({
  reconciliationItemId: z.string().uuid('Invalid reconciliation item ID'),
  transactionId: z.string().uuid('Invalid transaction ID'),
  notes: z.string().optional()
});

export const resolveDiscrepancySchema = z.object({
  itemId: z.string().uuid('Invalid reconciliation item ID'),
  resolution: z.enum(['ACCEPTED_DIFFERENCE', 'ADJUSTED', 'IGNORED', 'RESOLVED']).default('RESOLVED'),
  notes: z.string().optional()
});
