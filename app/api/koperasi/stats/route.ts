import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const koperasiId = searchParams.get('koperasiId');

    // If koperasiId provided, get individual koperasi stats
    if (koperasiId) {
      const koperasi = await prisma.koperasi.findUnique({
        where: { id: koperasiId },
      }) as any;

      if (!koperasi) {
        return NextResponse.json(
          { error: 'Koperasi not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          stats: {
            totalFunds: koperasi.totalFunds || 0,
            activeMembers: koperasi.activeMembers || 0,
            monthlyTransactions: koperasi.monthlyTransactions || 0,
          },
        },
        { status: 200 }
      );
    }

    // Otherwise, get overview stats (for admin dashboard)
    const total = await prisma.koperasi.count();
    const aktifSehat = await prisma.koperasi.count({
      where: { status: 'AKTIF_SEHAT' as any },
    });
    const aktifTidakSehat = await prisma.koperasi.count({
      where: { status: 'AKTIF_TIDAK_SEHAT' as any },
    });
    const pending = await prisma.koperasi.count({
      where: {
        status: {
          in: [
            'PENDING_VERIFICATION' as any,
            'PENDING_SURVEY' as any,
            'SURVEY_SCHEDULED' as any,
            'SURVEY_COMPLETED' as any,
            'PENDING_APPROVAL' as any,
          ],
        },
      },
    });

    return NextResponse.json(
      {
        total,
        aktifSehat,
        aktifTidakSehat,
        pending,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching koperasi stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const body = await request.json();
    const { totalFunds, activeMembers, monthlyTransactions } = body;

    // Find koperasi owned by user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { ownedKoperasi: true },
    });

    if (!user?.ownedKoperasi) {
      return NextResponse.json(
        { error: 'You do not own a koperasi' },
        { status: 403 }
      );
    }

    // Update stats
    const updatedKoperasi = await prisma.koperasi.update({
      where: { id: user.ownedKoperasi.id },
      data: {
        totalFunds: parseFloat(totalFunds) || 0,
        activeMembers: parseInt(activeMembers) || 0,
        monthlyTransactions: parseFloat(monthlyTransactions) || 0,
      } as any,
    }) as any;

    return NextResponse.json(
      {
        message: 'Statistics updated successfully',
        stats: {
          totalFunds: updatedKoperasi.totalFunds,
          activeMembers: updatedKoperasi.activeMembers,
          monthlyTransactions: updatedKoperasi.monthlyTransactions,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating stats:', error);
    return NextResponse.json(
      { error: 'Failed to update statistics' },
      { status: 500 }
    );
  }
}
