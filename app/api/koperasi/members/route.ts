import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Mendapatkan daftar anggota koperasi
export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    const token = cookie.split('auth-token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Untuk role LOW, ambil koperasi milik user
    let koperasiId: string;
    
    if (decoded.role === 'LOW') {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { ownedKoperasi: true }
      });

      if (!user?.ownedKoperasi) {
        return NextResponse.json(
          { error: 'Anda belum memiliki koperasi' },
          { status: 404 }
        );
      }

      koperasiId = user.ownedKoperasi.id;
    } else {
      // Untuk role HIGH, perlu koperasiId dari query
      const { searchParams } = new URL(request.url);
      const queryKoperasiId = searchParams.get('koperasiId');

      if (!queryKoperasiId) {
        return NextResponse.json(
          { error: 'Koperasi ID diperlukan' },
          { status: 400 }
        );
      }
      
      koperasiId = queryKoperasiId;
    }

    // Ambil daftar anggota
    const members = await prisma.member.findMany({
      where: { koperasiId },
      orderBy: { joinDate: 'desc' }
    });

    const summary = {
      total: members.length,
      active: members.filter((m: any) => m.isActive).length,
      inactive: members.filter((m: any) => !m.isActive).length,
    };

    return NextResponse.json({
      success: true,
      data: members,
      summary
    });

  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data anggota' },
      { status: 500 }
    );
  }
}

// POST - Tambah anggota baru
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    const token = cookie.split('auth-token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'LOW') {
      return NextResponse.json(
        { error: 'Hanya pengelola koperasi yang dapat menambah anggota' },
        { status: 403 }
      );
    }

    // Ambil koperasi milik user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { ownedKoperasi: true }
    });

    if (!user?.ownedKoperasi) {
      return NextResponse.json(
        { error: 'Anda belum memiliki koperasi' },
        { status: 404 }
      );
    }

    const koperasiId = user.ownedKoperasi.id;

    const body = await request.json();
    const {
      name,
      nik,
      dateOfBirth,
      placeOfBirth,
      gender,
      address,
      phone,
      email,
      memberNumber
    } = body;

    // Validasi input
    if (!name || !dateOfBirth || !address) {
      return NextResponse.json(
        { error: 'Field wajib harus diisi: nama, tanggal lahir, alamat' },
        { status: 400 }
      );
    }

    // Cek duplikasi NIK jika ada
    if (nik) {
      const existingMember = await prisma.member.findUnique({
        where: { nik }
      });

      if (existingMember) {
        return NextResponse.json(
          { error: 'NIK sudah terdaftar sebagai anggota' },
          { status: 400 }
        );
      }
    }

    // Tambah anggota baru
    const newMember = await prisma.member.create({
      data: {
        koperasiId,
        name,
        nik,
        dateOfBirth: new Date(dateOfBirth),
        placeOfBirth,
        gender,
        address,
        phone,
        email,
        memberNumber,
        isActive: true
      }
    });

    // Update jumlah anggota di koperasi
    await prisma.koperasi.update({
      where: { id: koperasiId },
      data: {
        totalMembers: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Anggota berhasil ditambahkan',
      data: newMember
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menambah anggota' },
      { status: 500 }
    );
  }
}

// PUT - Update data anggota
export async function PUT(request: Request) {
  try {
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    const token = cookie.split('auth-token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'LOW') {
      return NextResponse.json(
        { error: 'Hanya pengelola koperasi yang dapat mengupdate anggota' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { memberId, ...updateData } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID diperlukan' },
        { status: 400 }
      );
    }

    // Cek member dan verifikasi kepemilikan
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { koperasi: true }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Anggota tidak ditemukan' },
        { status: 404 }
      );
    }

    if (member.koperasi.ownerId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses ke anggota ini' },
        { status: 403 }
      );
    }

    // Update member
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        ...updateData,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Data anggota berhasil diupdate',
      data: updatedMember
    });

  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate anggota' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus anggota
export async function DELETE(request: Request) {
  try {
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    const token = cookie.split('auth-token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'LOW') {
      return NextResponse.json(
        { error: 'Hanya pengelola koperasi yang dapat menghapus anggota' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID diperlukan' },
        { status: 400 }
      );
    }

    // Cek member dan verifikasi kepemilikan
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { koperasi: true }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Anggota tidak ditemukan' },
        { status: 404 }
      );
    }

    if (member.koperasi.ownerId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses ke anggota ini' },
        { status: 403 }
      );
    }

    // Hapus member
    await prisma.member.delete({
      where: { id: memberId }
    });

    // Update jumlah anggota di koperasi
    await prisma.koperasi.update({
      where: { id: member.koperasiId },
      data: {
        totalMembers: {
          decrement: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Anggota berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus anggota' },
      { status: 500 }
    );
  }
}
