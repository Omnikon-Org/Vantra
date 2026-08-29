import express, { Application } from 'express';
import healthRoutes from './routes/health.routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// Basic Middleware
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
