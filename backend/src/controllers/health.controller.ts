import { Request, Response } from 'express';
import prisma from '../config/db';

export const getHealthStatus = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Vantra API is running'
  });
};

export const getDbHealthStatus = async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      message: 'Database connection is healthy'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database connection failed'
    });
  }
};
