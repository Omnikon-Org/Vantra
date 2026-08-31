import { Request, Response } from 'express';
import { ReconciliationService } from '../services/reconciliation.service';
import {
  runReconciliationSchema,
  manualMatchSchema,
  resolveDiscrepancySchema
} from '../validators/reconciliation.validator';
import { z } from 'zod';

export const runReconciliation = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user?.userId;
    const data = runReconciliationSchema.parse(req.body);
    const reconciliation = await ReconciliationService.run(tenantId, data, userId);
    res.status(201).json({ success: true, reconciliation });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
      return;
    }
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const listReconciliations = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const result = await ReconciliationService.list(
      tenantId,
      req.query as Record<string, string | undefined>
    );
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getReconciliation = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reconciliation = await ReconciliationService.getById(tenantId, req.params.id as string);
    res.status(200).json({ success: true, reconciliation });
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const manualMatch = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user?.userId;
    const data = manualMatchSchema.parse(req.body);
    const result = await ReconciliationService.manualMatch(tenantId, req.params.id as string, data, userId);
    res.status(200).json({ success: true, item: result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
      return;
    }
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const resolveDiscrepancy = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user?.userId;
    const data = resolveDiscrepancySchema.parse(req.body);
    const result = await ReconciliationService.resolveDiscrepancy(
      tenantId,
      req.params.id as string,
      data,
      userId
    );
    res.status(200).json({ success: true, item: result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
      return;
    }
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const deleteReconciliation = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user?.userId;
    const result = await ReconciliationService.delete(tenantId, req.params.id as string, userId);
    res.status(200).json(result);
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};
