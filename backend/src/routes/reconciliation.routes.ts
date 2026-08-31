import { Router } from 'express';
import {
  runReconciliation,
  listReconciliations,
  getReconciliation,
  manualMatch,
  resolveDiscrepancy,
  deleteReconciliation
} from '../controllers/reconciliation.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', runReconciliation);
router.get('/', listReconciliations);
router.get('/:id', getReconciliation);
router.post('/:id/manual-match', manualMatch);
router.post('/:id/resolve', resolveDiscrepancy);
router.delete('/:id', deleteReconciliation);

export default router;
