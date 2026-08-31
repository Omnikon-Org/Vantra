import { z } from 'zod';

export const createMerchantSchema = z.object({
  name: z.string().min(1, 'Name is required')
});
