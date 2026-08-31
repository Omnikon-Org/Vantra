import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';
import { createTransactionSchema, updateTransactionSchema } from '../validators/transaction.validator';
import { z } from 'zod';

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user?.userId;
    const data = createTransactionSchema.parse(req.body);
    const transaction = await TransactionService.create(tenantId, data, userId);
    res.status(201).json({ success: true, transaction });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ success: false, errors: error.issues });
       return;
    }
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const listTransactions = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const result = await TransactionService.list(tenantId, req.query as Record<string, string | undefined>);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTransaction = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const transaction = await TransactionService.getById(tenantId, req.params.id as string);
    res.status(200).json({ success: true, transaction });
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user?.userId;
    const data = updateTransactionSchema.parse(req.body);
    const transaction = await TransactionService.update(tenantId, req.params.id as string, data, userId);
    res.status(200).json({ success: true, transaction });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ success: false, errors: error.issues });
       return;
    }
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user?.userId;
    await TransactionService.delete(tenantId, req.params.id as string, userId);
    res.status(200).json({ success: true, message: 'Transaction deleted' });
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};
