import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const koperasiId = searchParams.get('koperasiId');

    if (!koperasiId) {
      return NextResponse.json(
        { error: 'Koperasi ID required' },
        { status: 400 }
      );
    }

    // Get all documents for this koperasi, excluding RAT documents
    const documents = await prisma.document.findMany({
      where: {
        koperasiId: koperasiId,
        documentType: {
          not: 'RAT' // Exclude RAT documents
        }
      },
      orderBy: {
        uploadDate: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
