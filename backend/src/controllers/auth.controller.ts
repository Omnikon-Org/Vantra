import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { z } from 'zod';
import crypto from 'crypto';

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

// Google OAuth: Initiate Redirect to Google
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = AuthService.getGoogleAuthUrl(state);
    res.redirect(authUrl);
  } catch (error: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
  }
};

// Google OAuth: Receive Callback from Google
export const googleCallback = async (req: Request, res: Response) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const { code, error, state } = req.query;

  if (error) {
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(String(error))}`);
    return;
  }

  if (!code) {
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('No authorization code received from Google')}`);
    return;
  }

  try {
    const result = await AuthService.handleGoogleCallback(String(code));
    // Redirect to frontend with JWT token in query parameter
    res.redirect(`${frontendUrl}/login?token=${encodeURIComponent(result.token)}`);
  } catch (err: any) {
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(err.message || 'Google authentication failed')}`);
  }
};

// Test / Verification handler for automated test suites
export const googleMockAuth = async (req: Request, res: Response) => {
  try {
    const { sub, email, name } = req.body;
    if (!sub || !email) {
      res.status(400).json({ success: false, message: 'sub and email are required' });
      return;
    }
    const result = await AuthService.handleGoogleCallback('mock_code', { sub, email, name });
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
