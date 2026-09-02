import { Request, Response } from 'express';
import { FraudDetectionService } from '../services/fraud.service';
import { analyzeBatchSchema, reviewAlertSchema, resolveAlertSchema, listAlertsQuerySchema } from '../validators/fraud.validator';
import { z } from 'zod';

export class FraudController {
  static async analyzeTransaction(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const transactionId = String(req.params.transactionId);
      const userId = req.user?.userId;

      const result = await FraudDetectionService.analyzeTransaction(tenantId, transactionId, userId);
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: error.issues });
        return;
      }
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  static async analyzeBatch(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const userId = req.user?.userId;
      const validated = analyzeBatchSchema.parse(req.body);

      const result = await FraudDetectionService.analyzeBatch(tenantId, validated.transactionIds, userId);
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: error.issues });
        return;
      }
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  static async listAlerts(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        status: req.query.status as string | undefined,
        severity: req.query.severity as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      const result = await FraudDetectionService.listAlerts(tenantId, query);
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  static async getAlertById(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const id = String(req.params.id);

      const alert = await FraudDetectionService.getAlertById(tenantId, id);
      res.status(200).json({ success: true, alert });
    } catch (error: any) {
      const status = error.statusCode || 404;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  static async reviewAlert(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const id = String(req.params.id);
      const userId = req.user?.userId;
      const validated = reviewAlertSchema.parse(req.body);

      const alert = await FraudDetectionService.reviewAlert(tenantId, id, userId, validated.notes);
      res.status(200).json({ success: true, alert, message: 'Fraud alert marked as in review' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: error.issues });
        return;
      }
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  static async resolveAlert(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const id = String(req.params.id);
      const userId = req.user?.userId;
      const validated = resolveAlertSchema.parse(req.body);

      const alert = await FraudDetectionService.resolveAlert(tenantId, id, userId, validated);
      res.status(200).json({ success: true, alert, message: `Fraud alert ${validated.status.toLowerCase()}` });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: error.issues });
        return;
      }
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const stats = await FraudDetectionService.getStats(tenantId);
      res.status(200).json({ success: true, stats });
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }
}
