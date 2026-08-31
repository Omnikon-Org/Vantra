import { Router } from 'express';
import { createCategory, listCategories } from '../controllers/category.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.post('/', createCategory);
router.get('/', listCategories);

export default router;
