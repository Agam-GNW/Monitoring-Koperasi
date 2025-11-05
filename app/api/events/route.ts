import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Ambil semua events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming');

    let whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (upcoming === 'true') {
      whereClause.eventDate = {
        gte: new Date()
      };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: {
        eventDate: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kegiatan' },
      { status: 500 }
    );
  }
}

// POST - Buat event baru (hanya admin)
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
        { error: 'Hanya admin yang dapat membuat kegiatan' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      organizer,
      maxParticipants
    } = body;

    // Validasi
    if (!title || !eventDate || !startTime || !endTime || !location || !organizer) {
      return NextResponse.json(
        { error: 'Data kegiatan tidak lengkap' },
        { status: 400 }
      );
    }

    // Tentukan status berdasarkan tanggal
    const eventDateTime = new Date(eventDate);
    const now = new Date();
    let status = 'UPCOMING';

    if (eventDateTime < now) {
      status = 'COMPLETED';
    } else if (
      eventDateTime.toDateString() === now.toDateString()
    ) {
      status = 'ONGOING';
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventDate: new Date(eventDate),
        startTime,
        endTime,
        location,
        organizer,
        status,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        createdBy: decoded.userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Kegiatan berhasil dibuat',
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Gagal membuat kegiatan' },
      { status: 500 }
    );
  }
}
