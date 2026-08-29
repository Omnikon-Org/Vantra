import { Router } from 'express';
import { getHealthStatus, getDbHealthStatus } from '../controllers/health.controller';

const router = Router();

router.get('/', getHealthStatus);
router.get('/db', getDbHealthStatus);

export default router;
