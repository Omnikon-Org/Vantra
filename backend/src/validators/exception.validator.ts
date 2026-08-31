import { z } from 'zod';

export const listExceptionsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  exceptionType: z.string().optional(),
  reconciliationId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const updateExceptionStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED']),
  notes: z.string().optional()
});

export const resolveExceptionSchema = z.object({
  resolutionNotes: z.string().min(1, 'Resolution notes are required')
});
