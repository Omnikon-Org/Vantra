import { z } from 'zod';

export const createTransactionSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  merchantId: z.string().uuid('Invalid merchant ID').optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('USD'),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).default('EXPENSE'),
  description: z.string().optional(),
  transactionAt: z.string().datetime().optional()
});

export const updateTransactionSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID').optional().nullable(),
  merchantId: z.string().uuid('Invalid merchant ID').optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional()
});

// We only allow updating meta-fields for simplicity in Step 4. 
// Changing amounts or accounts requires complex ledger reversal, left for future steps.
