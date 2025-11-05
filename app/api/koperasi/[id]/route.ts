import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// Interface untuk update data koperasi
interface UpdateKoperasiData {
  id: string;
  name?: string;
  type?: 'SIMPAN_PINJAM' | 'KONSUMSI' | 'PRODUKSI' | 'JASA' | 'SERBA_USAHA';
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  totalMembers?: number;
  description?: string;
  status?: 'AKTIF' | 'NONAKTIF';
}

// GET - Mendapatkan detail koperasi berdasarkan ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Authentication check
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Fetch koperasi from database
    const koperasi = await prisma.koperasi.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        members: {
          orderBy: { joinDate: 'desc' },
        },
        activities: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        documents: {
          orderBy: { uploadDate: 'desc' },
        },
      },
    });
    
    if (!koperasi) {
      return NextResponse.json(
        { error: 'Koperasi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: koperasi
    });

  } catch (error) {
    console.error('Error fetching koperasi detail:', error);
    
    return NextResponse.json({
      error: 'Terjadi kesalahan saat mengambil data koperasi'
    }, { status: 500 });
  }
}

// PUT - Update data koperasi
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // Authentication check
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user to verify role and ownership
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { ownedKoperasi: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only LOW users can update their own koperasi
    if (user.role !== 'LOW') {
      return NextResponse.json({ error: 'Forbidden: Only koperasi owners can update' }, { status: 403 });
    }

    // Verify the user owns this koperasi
    if (!user.ownedKoperasi || user.ownedKoperasi.id !== id) {
      return NextResponse.json({ error: 'Forbidden: You can only update your own koperasi' }, { status: 403 });
    }
    
    const {
      name,
      type,
      address,
      contactPerson,
      contactPhone,
      contactEmail,
      totalMembers,
      description,
      status
    }: UpdateKoperasiData = body;

    // Validasi input yang diperlukan
    if (name && name.trim().length < 3) {
      return NextResponse.json(
        { error: 'Nama koperasi minimal 3 karakter' },
        { status: 400 }
      );
    }

    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    if (contactPhone && !/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(contactPhone)) {
      return NextResponse.json(
        { error: 'Format nomor telepon tidak valid' },
        { status: 400 }
      );
    }

    if (totalMembers && totalMembers < 20) {
      return NextResponse.json(
        { error: 'Minimum 20 anggota untuk koperasi' },
        { status: 400 }
      );
    }

    // Build update data object (only include provided fields)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (address !== undefined) updateData.address = address;
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (totalMembers !== undefined) updateData.totalMembers = totalMembers;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    // Update koperasi in database
    const updatedKoperasi = await prisma.koperasi.update({
      where: { id },
      data: updateData,
    });

    // Log aktivitas update
    await prisma.activity.create({
      data: {
        title: 'Update Data Koperasi',
        description: `Data koperasi ${updatedKoperasi.name} berhasil diperbarui`,
        date: new Date(),
        type: 'OTHER',
        status: 'COMPLETED',
        koperasiId: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data koperasi berhasil diperbarui',
      data: updatedKoperasi
    });

  } catch (error) {
    console.error('Error updating koperasi:', error);
    
    return NextResponse.json({
      error: 'Terjadi kesalahan saat memperbarui data koperasi'
    }, { status: 500 });
  }
}

// DELETE - Nonaktifkan koperasi (untuk role LOW)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Authentication check
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user to verify role and ownership
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { ownedKoperasi: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only LOW users can deactivate their own koperasi
    if (user.role !== 'LOW') {
      return NextResponse.json({ error: 'Forbidden: Only koperasi owners can deactivate' }, { status: 403 });
    }

    // Verify the user owns this koperasi
    if (!user.ownedKoperasi || user.ownedKoperasi.id !== id) {
      return NextResponse.json({ error: 'Forbidden: You can only deactivate your own koperasi' }, { status: 403 });
    }
    
    // Role LOW hanya bisa menonaktifkan, tidak benar-benar menghapus
    const deactivatedKoperasi = await prisma.koperasi.update({
      where: { id },
      data: {
        status: 'AKTIF_TIDAK_SEHAT', // Status untuk koperasi yang tidak aktif
      },
    });

    // Log aktivitas deactivation
    await prisma.activity.create({
      data: {
        title: 'Koperasi Dinonaktifkan',
        description: `Koperasi ${deactivatedKoperasi.name} telah dinonaktifkan`,
        date: new Date(),
        type: 'OTHER',
        status: 'COMPLETED',
        koperasiId: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Koperasi berhasil dinonaktifkan',
      data: deactivatedKoperasi
    });

  } catch (error) {
    console.error('Error deactivating koperasi:', error);
    
    return NextResponse.json({
      error: 'Terjadi kesalahan saat menonaktifkan koperasi'
    }, { status: 500 });
  }
}

// PATCH - Update status koperasi (untuk role HIGH/admin)
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // Authentication check
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user to verify role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only HIGH (admin) users can update status
    if (user.role !== 'HIGH') {
      return NextResponse.json({ error: 'Forbidden: Only admin can update status' }, { status: 403 });
    }

    const { status } = body;

    if (!status || !['AKTIF_SEHAT', 'AKTIF_TIDAK_SEHAT'].includes(status)) {
      return NextResponse.json(
        { error: 'Status harus AKTIF_SEHAT atau AKTIF_TIDAK_SEHAT' },
        { status: 400 }
      );
    }

    // Update koperasi status
    const updatedKoperasi = await prisma.koperasi.update({
      where: { id },
      data: { status },
    });

    // Log aktivitas update status
    await prisma.activity.create({
      data: {
        title: 'Perubahan Status Koperasi',
        description: `Status koperasi ${updatedKoperasi.name} diubah menjadi ${status === 'AKTIF_SEHAT' ? 'Aktif - Sehat' : 'Aktif - Tidak Sehat'} oleh admin`,
        date: new Date(),
        type: 'OTHER',
        status: 'COMPLETED',
        koperasiId: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Status koperasi berhasil diubah',
      data: updatedKoperasi
    });

  } catch (error) {
    console.error('Error updating status:', error);
    
    return NextResponse.json({
      error: 'Terjadi kesalahan saat mengubah status koperasi'
    }, { status: 500 });
  }
}
