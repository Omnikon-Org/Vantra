import prisma from '../config/db';
import { hashPassword, verifyPassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { registerSchema, loginSchema } from '../validators/auth.validator';

export class AuthService {
  static async register(data: z.infer<typeof registerSchema>) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await hashPassword(data.password);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const tenant = await tx.tenant.create({
        data: { name: data.tenantName }
      });

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          name: data.name,
          role: 'ADMIN',
          tenantId: tenant.id
        }
      });

      return { user, tenant };
    });

    const token = generateToken({
      userId: result.user.id,
      tenantId: result.user.tenantId,
      role: result.user.role
    });

    const { passwordHash, ...safeUser } = result.user;
    return { user: safeUser, token };
  }

  static async login(data: z.infer<typeof loginSchema>) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new Error('This account was created with Google. Please use Google Sign In.');
    }

    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role
    });

    const { passwordHash, ...safeUser } = user;
    return { user: safeUser, token };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true }
    });
    if (!user) throw new Error('User not found');

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  // Google OAuth URL Generation
  static getGoogleAuthUrl(state: string): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback';

    if (!clientId) {
      throw new Error('Google OAuth is not configured on this server (missing GOOGLE_CLIENT_ID in .env)');
    }

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      redirect_uri: callbackUrl,
      client_id: clientId,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: 'openid email profile',
      state,
    });

    return `${rootUrl}?${params.toString()}`;
  }

  // Google OAuth Callback Handler & Account Linking
  static async handleGoogleCallback(code: string, mockProfile?: { sub: string; email: string; name?: string }) {
    let googleUser: { sub: string; email: string; name?: string };

    // Support testing mode with mockProfile
    if (mockProfile) {
      googleUser = mockProfile;
    } else {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback';

      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials missing on server');
      }

      // 1. Exchange authorization code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData: any = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange Google authorization code');
      }

      // 2. Retrieve verified user profile from Google OpenID Userinfo
      const userResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const profileData: any = await userResponse.json();
      if (!userResponse.ok || !profileData.sub || !profileData.email) {
        throw new Error('Failed to retrieve verified Google profile');
      }

      googleUser = {
        sub: profileData.sub,
        email: profileData.email,
        name: profileData.name,
      };
    }

    const { sub: googleId, email, name } = googleUser;

    // 3. User & Tenant Resolution
    // Case A: User already linked by googleId
    let user = await prisma.user.findUnique({
      where: { googleId },
      include: { tenant: true },
    });

    if (!user) {
      // Case B: User exists with same email (link Google ID without modifying passwordHash or tenant)
      const existingByEmail = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true },
      });

      if (existingByEmail) {
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleId,
            name: existingByEmail.name || name || null,
          },
          include: { tenant: true },
        });
      } else {
        // Case C: New Google User -> Create Tenant + User atomically
        const defaultTenantName = name ? `${name}'s Organization` : 'My Organization';
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          const tenant = await tx.tenant.create({
            data: { name: defaultTenantName },
          });

          const newUser = await tx.user.create({
            data: {
              email,
              name: name || null,
              googleId,
              authProvider: 'GOOGLE',
              role: 'ADMIN',
              tenantId: tenant.id,
            },
            include: { tenant: true },
          });

          return newUser;
        });
        user = result;
      }
    }

    // 4. Generate standard Vantra JWT
    const token = generateToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });

    const { passwordHash, ...safeUser } = user;
    return { user: safeUser, token };
  }
}
