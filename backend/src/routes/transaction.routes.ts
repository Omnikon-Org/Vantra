import { Router } from 'express';
import { createTransaction, listTransactions, getTransaction, updateTransaction, deleteTransaction } from '../controllers/transaction.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.post('/', createTransaction);
router.get('/', listTransactions);
router.get('/:id', getTransaction);
router.patch('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
