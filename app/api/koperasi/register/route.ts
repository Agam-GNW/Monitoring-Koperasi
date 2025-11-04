import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Interface untuk data koperasi baru
interface NewKoperasiData {
  name: string;
  type: 'SIMPAN_PINJAM' | 'KONSUMSI' | 'PRODUKSI' | 'JASA' | 'SERBA_USAHA';
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  totalMembers: number;
  description: string;
  establishmentDate: string;
}

export async function POST(request: Request) {
  try {
    // Verifikasi user login dan role
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    const token = cookie.split('auth-token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'LOW') {
      return NextResponse.json(
        { error: 'Hanya user dengan role LOW yang dapat mendaftarkan koperasi' },
        { status: 403 }
      );
    }

    const userId = decoded.userId;
    
    // Cek apakah user sudah punya koperasi
    const existingKoperasi = await prisma.koperasi.findUnique({
      where: { ownerId: userId }
    });

    if (existingKoperasi) {
      return NextResponse.json(
        { 
          error: 'Anda sudah memiliki koperasi. Setiap user hanya dapat mengajukan satu koperasi.',
          existingKoperasi: {
            id: existingKoperasi.id,
            name: existingKoperasi.name,
            status: existingKoperasi.status
          }
        },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validasi data yang diperlukan
    const {
      name,
      type,
      address,
      contactPerson,
      contactPhone,
      contactEmail,
      totalMembers,
      description,
      establishmentDate
    }: NewKoperasiData = body;

    // Validasi input
    if (!name || !type || !address || !contactPerson || !contactPhone || !contactEmail) {
      return NextResponse.json(
        { error: 'Semua field wajib harus diisi' },
        { status: 400 }
      );
    }

    if (totalMembers < 20) {
      return NextResponse.json(
        { error: 'Minimum 20 anggota untuk mendirikan koperasi' },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Validasi format nomor telepon Indonesia
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    if (!phoneRegex.test(contactPhone)) {
      return NextResponse.json(
        { error: 'Format nomor telepon tidak valid' },
        { status: 400 }
      );
    }

    // Generate ID untuk koperasi baru
    const koperasiId = `kop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Simpan koperasi baru ke database
    const newKoperasi = await prisma.koperasi.create({
      data: {
        id: koperasiId,
        name: name.trim(),
        type,
        status: 'PENDING_VERIFICATION', // Status awal menunggu verifikasi dokumen
        legalStatus: 'NOT_SUBMITTED',
        totalMembers,
        submissionDate: new Date(), // Tanggal pengajuan
        address: address.trim(),
        contactPerson: contactPerson.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        description: description.trim(),
        ownerId: userId, // Relasi one-to-one dengan user
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    console.log('Koperasi baru berhasil didaftarkan:', {
      id: newKoperasi.id,
      name: newKoperasi.name,
      status: newKoperasi.status,
      ownerId: newKoperasi.ownerId
    });

    // Log aktivitas pengajuan
    console.log('Activity log: Pengajuan koperasi baru -', name);

    // Response sukses
    return NextResponse.json({
      success: true,
      message: 'Pengajuan koperasi berhasil disubmit. Menunggu persetujuan admin.',
      koperasi: {
        id: newKoperasi.id,
        name: newKoperasi.name,
        status: newKoperasi.status,
        submissionDate: newKoperasi.submissionDate,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error registering koperasi:', error);
    
    return NextResponse.json({
      error: 'Terjadi kesalahan internal server',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

// GET endpoint untuk mengambil koperasi milik user yang login
export async function GET(request: Request) {
  try {
    // Verifikasi user login
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    const token = cookie.split('auth-token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Ambil koperasi milik user dari database
    const userKoperasi = await prisma.koperasi.findUnique({
      where: { ownerId: userId }
    });

    if (!userKoperasi) {
      return NextResponse.json({
        success: true,
        data: null,
        hasKoperasi: false
      });
    }

    return NextResponse.json({
      success: true,
      data: userKoperasi,
      hasKoperasi: true
    });

  } catch (error) {
    console.error('Error fetching user koperasi:', error);
    
    return NextResponse.json({
      error: 'Terjadi kesalahan saat mengambil data koperasi'
    }, { status: 500 });
  }
}
