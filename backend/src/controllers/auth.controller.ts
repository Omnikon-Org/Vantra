import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { z } from 'zod';

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await AuthService.register(data);
    res.status(201).json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ success: false, errors: error.issues });
       return;
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await AuthService.login(data);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
      return;
    }
    res.status(401).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
       res.status(401).json({ success: false, message: 'Unauthorized' });
       return;
    }
    const user = await AuthService.getMe(userId);
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
};
