import { Router } from 'express';
import { createMerchant, listMerchants } from '../controllers/merchant.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.post('/', createMerchant);
router.get('/', listMerchants);

export default router;
