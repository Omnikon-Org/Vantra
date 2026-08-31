import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['BANK', 'CREDIT', 'CASH']).default('BANK'),
  currency: z.string().length(3).default('USD')
});

export const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  type: z.enum(['BANK', 'CREDIT', 'CASH']).optional(),
});
