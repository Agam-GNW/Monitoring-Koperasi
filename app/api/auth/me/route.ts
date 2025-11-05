import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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
        phone: true,
        profileImage: true,
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
            registrationDate: true,
          }
        }
      }
    });

    console.log('[/api/auth/me] User found:', !!user);
    console.log('[/api/auth/me] User profileImage:', user?.profileImage);
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

export async function PATCH(request: Request) {
  try {
    console.log('[/api/auth/me] PATCH Endpoint called');
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone, currentPassword, newPassword } = body;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, password: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password required' },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        profileImage: true,
      }
    });

    console.log('[/api/auth/me] User updated successfully');
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('[/api/auth/me] PATCH Error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
