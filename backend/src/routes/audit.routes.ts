import { Router } from 'express';
import { listAuditLogs } from '../controllers/audit.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', listAuditLogs);

export default router;
