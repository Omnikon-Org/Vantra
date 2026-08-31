import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';
import { listAuditLogsSchema } from '../validators/audit.validator';
import { z } from 'zod';

export const listAuditLogs = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const query = listAuditLogsSchema.parse(req.query);
    const result = await AuditService.list(tenantId, query as Record<string, string | undefined>);
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
