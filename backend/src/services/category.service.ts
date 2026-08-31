import prisma from '../config/db';
import { z } from 'zod';
import { createCategorySchema } from '../validators/category.validator';

export class CategoryService {
  static async create(tenantId: string, data: z.infer<typeof createCategorySchema>) {
    return prisma.category.create({
      data: {
        ...data,
        tenantId
      }
    });
  }

  static async list(tenantId: string) {
    return prisma.category.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
  }
}
