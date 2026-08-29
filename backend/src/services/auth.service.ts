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
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
