import { Router } from 'express';
import {
  listExceptions,
  getException,
  updateExceptionStatus,
  resolveException
} from '../controllers/exception.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', listExceptions);
router.get('/:id', getException);
router.patch('/:id/status', updateExceptionStatus);
router.post('/:id/resolve', resolveException);

export default router;
