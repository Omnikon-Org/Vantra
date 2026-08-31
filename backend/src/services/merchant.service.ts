import prisma from '../config/db';
import { z } from 'zod';
import { createMerchantSchema } from '../validators/merchant.validator';

export class MerchantService {
  static async create(tenantId: string, data: z.infer<typeof createMerchantSchema>) {
    return prisma.merchant.create({
      data: {
        ...data,
        tenantId
      }
    });
  }

  static async list(tenantId: string) {
    return prisma.merchant.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
  }
}
