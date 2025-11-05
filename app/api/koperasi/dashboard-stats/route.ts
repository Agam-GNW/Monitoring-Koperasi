import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all koperasi
    const allKoperasi = await prisma.koperasi.findMany({
      select: {
        type: true,
        status: true,
        legalStatus: true,
      }
    });

    const total = allKoperasi.length;

    // Count by type
    const typeCount: { [key: string]: number } = {};
    allKoperasi.forEach(k => {
      typeCount[k.type] = (typeCount[k.type] || 0) + 1;
    });

    // Calculate type distribution
    const typeDistribution = Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0
    }));

    // Count by status
    const aktifSehat = allKoperasi.filter(k => k.status === 'AKTIF_SEHAT').length;
    const aktifTidakSehat = allKoperasi.filter(k => k.status === 'AKTIF_TIDAK_SEHAT').length;
    const pending = allKoperasi.filter(k => 
      ['PENDING_VERIFICATION', 'PENDING_SURVEY', 'SURVEY_SCHEDULED', 'SURVEY_COMPLETED', 'PENDING_APPROVAL'].includes(k.status)
    ).length;

    // Count by legal status
    const legal = allKoperasi.filter(k => k.legalStatus === 'LEGAL').length;
    const pendingLegal = allKoperasi.filter(k => k.legalStatus === 'PENDING_REVIEW').length;

    return NextResponse.json({
      success: true,
      data: {
        total,
        typeDistribution,
        status: {
          aktifSehat,
          aktifTidakSehat,
          pending,
          total
        },
        legal: {
          legal,
          pendingLegal,
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil statistik dashboard' },
      { status: 500 }
    );
  }
}
