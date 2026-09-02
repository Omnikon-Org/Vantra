import { z } from 'zod';

export const analyzeBatchSchema = z.object({
  transactionIds: z.array(z.string().uuid()).optional(),
});

export const reviewAlertSchema = z.object({
  notes: z.string().max(1000).optional(),
});

export const resolveAlertSchema = z.object({
  status: z.enum(['CONFIRMED', 'DISMISSED', 'RESOLVED']),
  resolutionNotes: z.string().min(3, 'Resolution notes must be at least 3 characters').max(2000),
});

export const listAlertsQuerySchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 20)),
  status: z.enum(['OPEN', 'IN_REVIEW', 'CONFIRMED', 'DISMISSED', 'RESOLVED']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
