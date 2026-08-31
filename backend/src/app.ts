import express, { Application } from 'express';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import accountRoutes from './routes/account.routes';
import categoryRoutes from './routes/category.routes';
import merchantRoutes from './routes/merchant.routes';
import transactionRoutes from './routes/transaction.routes';
import reconciliationRoutes from './routes/reconciliation.routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// Basic Middleware
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reconciliation', reconciliationRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
