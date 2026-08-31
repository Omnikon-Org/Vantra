import { Request, Response } from 'express';
import { ExceptionService } from '../services/exception.service';
import {
  listExceptionsSchema,
  updateExceptionStatusSchema,
  resolveExceptionSchema
} from '../validators/exception.validator';
import { z } from 'zod';

export const listExceptions = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const query = listExceptionsSchema.parse(req.query);
    const result = await ExceptionService.list(
      tenantId,
      query as Record<string, string | undefined>
    );
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
      return;
    }
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const getException = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const exception = await ExceptionService.getById(tenantId, req.params.id as string);
    res.status(200).json({ success: true, exception });
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const updateExceptionStatus = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    const data = updateExceptionStatusSchema.parse(req.body);
    const exception = await ExceptionService.updateStatus(
      tenantId,
      userId,
      req.params.id as string,
      data.status,
      data.notes
    );
    res.status(200).json({ success: true, exception });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
      return;
    }
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const resolveException = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    const data = resolveExceptionSchema.parse(req.body);
    const exception = await ExceptionService.resolve(
      tenantId,
      userId,
      req.params.id as string,
      data
    );
    res.status(200).json({ success: true, exception });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
      return;
    }
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};
