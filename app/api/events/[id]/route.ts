import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Ambil detail event by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Kegiatan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kegiatan' },
      { status: 500 }
    );
  }
}

// PATCH - Update event (hanya admin)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
        { error: 'Hanya admin yang dapat mengubah kegiatan' },
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
      status,
      maxParticipants
    } = body;

    const updateData: any = {};

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (eventDate) updateData.eventDate = new Date(eventDate);
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (location) updateData.location = location;
    if (organizer) updateData.organizer = organizer;
    if (status) updateData.status = status;
    if (maxParticipants !== undefined) {
      updateData.maxParticipants = maxParticipants ? parseInt(maxParticipants) : null;
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Kegiatan berhasil diupdate',
      data: event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate kegiatan' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus event (hanya admin)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
        { error: 'Hanya admin yang dapat menghapus kegiatan' },
        { status: 403 }
      );
    }

    await prisma.event.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Kegiatan berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus kegiatan' },
      { status: 500 }
    );
  }
}
