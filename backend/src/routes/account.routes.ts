import { Router } from 'express';
import { createAccount, listAccounts, getAccount, updateAccount, deleteAccount } from '../controllers/account.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.post('/', createAccount);
router.get('/', listAccounts);
router.get('/:id', getAccount);
router.patch('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;
