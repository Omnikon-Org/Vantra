import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { createCategorySchema } from '../validators/category.validator';
import { z } from 'zod';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = createCategorySchema.parse(req.body);
    const category = await CategoryService.create(tenantId, data);
    res.status(201).json({ success: true, category });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ success: false, errors: error.issues });
       return;
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const listCategories = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const categories = await CategoryService.list(tenantId);
    res.status(200).json({ success: true, categories });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
