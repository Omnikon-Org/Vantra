import { Router } from 'express';
import { FraudController } from '../controllers/fraud.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/analyze/:transactionId', FraudController.analyzeTransaction);
router.post('/analyze', FraudController.analyzeBatch);
router.get('/alerts', FraudController.listAlerts);
router.get('/alerts/:id', FraudController.getAlertById);
router.post('/alerts/:id/review', FraudController.reviewAlert);
router.post('/alerts/:id/resolve', FraudController.resolveAlert);
router.get('/stats', FraudController.getStats);

export default router;
