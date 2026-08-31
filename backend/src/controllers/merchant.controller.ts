import { Request, Response } from 'express';
import { MerchantService } from '../services/merchant.service';
import { createMerchantSchema } from '../validators/merchant.validator';
import { z } from 'zod';

export const createMerchant = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = createMerchantSchema.parse(req.body);
    const merchant = await MerchantService.create(tenantId, data);
    res.status(201).json({ success: true, merchant });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ success: false, errors: error.issues });
       return;
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const listMerchants = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const merchants = await MerchantService.list(tenantId);
    res.status(200).json({ success: true, merchants });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
