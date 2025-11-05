import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

// POST: Upload profile image
export async function POST(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    console.log('[Upload Profile Image] Token exists:', !!token);

    if (!token) {
      console.log('[Upload Profile Image] No token found in cookies');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'File diperlukan' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Hanya file JPG, PNG, dan WEBP yang diperbolehkan' },
        { status: 400 }
      );
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file harus kurang dari 2MB' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, profileImage: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    await mkdir(uploadDir, { recursive: true });

    // Delete old profile image if exists
    if (user.profileImage) {
      try {
        const oldImagePath = path.join(process.cwd(), 'public', user.profileImage);
        await unlink(oldImagePath);
      } catch (err) {
        console.log('Old image not found or already deleted');
      }
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const timestamp = Date.now();
    const filename = `profile-${user.id}-${timestamp}${fileExtension}`;
    const filepath = path.join(uploadDir, filename);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // Save to database
    const relativePath = `/uploads/profiles/${filename}`;
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        profileImage: relativePath,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
      }
    });

    return NextResponse.json(
      { 
        message: 'Foto profil berhasil diupload',
        user: updatedUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json(
      { error: 'Gagal mengupload foto profil' },
      { status: 500 }
    );
  }
}

// DELETE: Remove profile image
export async function DELETE(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, profileImage: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete profile image file if exists
    if (user.profileImage) {
      try {
        const imagePath = path.join(process.cwd(), 'public', user.profileImage);
        await unlink(imagePath);
      } catch (err) {
        console.log('Image file not found or already deleted');
      }

      // Remove from database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          profileImage: null,
        }
      });
    }

    return NextResponse.json(
      { message: 'Foto profil berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting profile image:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus foto profil' },
      { status: 500 }
    );
  }
}
