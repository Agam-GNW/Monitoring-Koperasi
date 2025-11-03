import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    console.log('[/api/auth/me] GET Endpoint called');
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    console.log('[/api/auth/me] Token exists:', !!token);
    
    if (!token) {
      console.log('[/api/auth/me] No token found');
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    console.log('[/api/auth/me] Decoded:', decoded);
    if (!decoded) {
      console.log('[/api/auth/me] Invalid token');
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        ownedKoperasi: {
          select: {
            id: true,
            name: true,
            status: true,
            legalStatus: true,
            type: true,
            totalMembers: true,
            address: true,
            contactPerson: true,
            contactPhone: true,
            contactEmail: true,
            description: true,
            submissionDate: true,
            approvalDate: true,
            approvalNotes: true,
            rejectionReason: true,
          }
        }
      }
    });

    console.log('[/api/auth/me] User found:', !!user);
    if (!user) {
      console.log('[/api/auth/me] User not found in database - clearing cookie');
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
      response.cookies.delete('auth-token');
      return response;
    }

    console.log('[/api/auth/me] Returning user data');
    return NextResponse.json({
      user
    });

  } catch (error) {
    console.error('[/api/auth/me] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
