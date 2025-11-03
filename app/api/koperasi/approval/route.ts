import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

interface ApprovalData {
  koperasiId: string;
  action: 'APPROVE_SEHAT' | 'APPROVE_TIDAK_SEHAT' | 'REJECT';
  notes?: string;
  rejectionReason?: string;
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    const token = cookie.split('auth-token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'HIGH') {
      return NextResponse.json(
        { error: 'Hanya admin yang bisa melakukan approval' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { koperasiId, action, notes, rejectionReason }: ApprovalData = body;

    if (!koperasiId || !action) {
      return NextResponse.json(
        { error: 'ID koperasi dan aksi wajib diisi' },
        { status: 400 }
      );
    }

    if (action === 'REJECT' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Alasan penolakan wajib diisi untuk aksi reject' },
        { status: 400 }
      );
    }

    const koperasi = await prisma.koperasi.findUnique({
      where: { id: koperasiId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
    
    if (!koperasi) {
      return NextResponse.json({ error: 'Koperasi tidak ditemukan' }, { status: 404 });
    }

    if (koperasi.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Koperasi sudah diproses sebelumnya' },
        { status: 400 }
      );
    }

    let newStatus: 'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT' | 'TIDAK_DISETUJUI';
    let message: string;
    
    switch (action) {
      case 'APPROVE_SEHAT':
        newStatus = 'AKTIF_SEHAT';
        message = 'Koperasi disetujui dengan status Aktif - Sehat';
        break;
      case 'APPROVE_TIDAK_SEHAT':
        newStatus = 'AKTIF_TIDAK_SEHAT';
        message = 'Koperasi disetujui dengan status Aktif - Tidak Sehat';
        break;
      case 'REJECT':
        newStatus = 'TIDAK_DISETUJUI';
        message = 'Koperasi ditolak';
        break;
      default:
        return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
    }

    const updatedKoperasi = await prisma.koperasi.update({
      where: { id: koperasiId },
      data: {
        status: newStatus,
        approvalDate: new Date(),
        approvalNotes: notes || '',
        rejectionReason: action === 'REJECT' ? rejectionReason : null,
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

    console.log('Koperasi approval processed:', {
      id: updatedKoperasi.id,
      name: updatedKoperasi.name,
      status: updatedKoperasi.status,
      approvedBy: decoded.email
    });

    return NextResponse.json({
      success: true,
      message: message,
      data: {
        koperasiId: updatedKoperasi.id,
        name: updatedKoperasi.name,
        status: updatedKoperasi.status,
        approvalDate: updatedKoperasi.approvalDate,
        approvalNotes: updatedKoperasi.approvalNotes,
        rejectionReason: updatedKoperasi.rejectionReason,
      }
    });

  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses approval' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';
    const token = cookie.split('auth-token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'HIGH') {
      return NextResponse.json(
        { error: 'Hanya admin yang bisa mengakses data ini' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const status = searchParams.get('status') || 'ALL';
    
    const whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const koperasiList = await prisma.koperasi.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        submissionDate: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.koperasi.count({ where: whereClause });

    const summary = {
      pending: await prisma.koperasi.count({ where: { status: 'PENDING' } }),
      approved_sehat: await prisma.koperasi.count({ where: { status: 'AKTIF_SEHAT' } }),
      approved_tidak_sehat: await prisma.koperasi.count({ where: { status: 'AKTIF_TIDAK_SEHAT' } }),
      rejected: await prisma.koperasi.count({ where: { status: 'TIDAK_DISETUJUI' } }),
    };

    const formattedData = koperasiList.map(k => ({
      id: k.id,
      name: k.name,
      type: k.type,
      status: k.status,
      legalStatus: k.legalStatus,
      totalMembers: k.totalMembers,
      registrationDate: k.createdAt,
      submissionDate: k.submissionDate,
      approvalDate: k.approvalDate,
      approvalNotes: k.approvalNotes,
      rejectionReason: k.rejectionReason,
      address: k.address,
      contactPerson: k.contactPerson,
      contactPhone: k.contactPhone,
      contactEmail: k.contactEmail,
      description: k.description,
      ownerId: k.ownerId,
      ownerName: k.owner.name,
      ownerEmail: k.owner.email,
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary
    });

  } catch (error) {
    console.error('Error fetching approval list:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data approval' },
      { status: 500 }
    );
  }
}
