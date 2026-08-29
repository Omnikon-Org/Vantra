import express, { Application } from 'express';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// Basic Middleware
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
