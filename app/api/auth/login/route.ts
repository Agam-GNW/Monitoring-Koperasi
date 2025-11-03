import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password diperlukan'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Login attempt for:', body.email);
    
    const { email, password } = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        ownedKoperasi: {
          select: {
            id: true,
            name: true,
            status: true,
            legalStatus: true,
          }
        }
      }
    });

    if (!user) {
      console.log('User not found for email:', email);
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    console.log('User found:', { id: user.id, email: user.email, role: user.role });

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    console.log('Password verified successfully for user:', email);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Prepare user data for response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      koperasi: user.ownedKoperasi,
    };

    const response = NextResponse.json({
      message: 'Login berhasil',
      user: userData,
      token
    });

    // Set HTTP-only cookie for token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/', // Ensure cookie is available for all paths
    });

    console.log('Login successful for user:', email, 'with role:', user.role);
    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Validation error:', error.issues);
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
