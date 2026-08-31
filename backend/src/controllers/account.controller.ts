import { Request, Response } from 'express';
import { AccountService } from '../services/account.service';
import { createAccountSchema, updateAccountSchema } from '../validators/account.validator';
import { z } from 'zod';

export const createAccount = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = createAccountSchema.parse(req.body);
    const account = await AccountService.create(tenantId, data);
    res.status(201).json({ success: true, account });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ success: false, errors: error.issues });
       return;
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const listAccounts = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const accounts = await AccountService.list(tenantId);
    res.status(200).json({ success: true, accounts });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAccount = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const account = await AccountService.getById(tenantId, req.params.id as string);
    res.status(200).json({ success: true, account });
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = updateAccountSchema.parse(req.body);
    const account = await AccountService.update(tenantId, req.params.id as string, data);
    res.status(200).json({ success: true, account });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ success: false, errors: error.issues });
       return;
    }
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    await AccountService.delete(tenantId, req.params.id as string);
    res.status(200).json({ success: true, message: 'Account deleted' });
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};
