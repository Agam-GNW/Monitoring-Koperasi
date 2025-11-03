import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyToken } from '@/lib/auth';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password harus minimal 6 karakter'),
  role: z.enum(['HIGH', 'LOW']),
});

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true }
  });

  return user;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const currentUser = await getUserFromToken();
    if (!currentUser || currentUser.role !== 'HIGH') {
      return NextResponse.json(
        { error: 'Unauthorized. Hanya admin HIGH yang dapat membuat user baru.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role } = createUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        emailVerified: new Date(), // Auto-verify for admin created users
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerified: true,
      }
    });

    return NextResponse.json({
      message: 'User berhasil dibuat',
      user
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
