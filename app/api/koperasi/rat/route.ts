import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all RAT documents with koperasi information
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const koperasiId = searchParams.get('koperasiId');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {
      documentType: 'RAT',
    };

    if (koperasiId) {
      where.koperasiId = koperasiId;
    }

    if (status) {
      where.status = status;
    }

    // Fetch RAT documents
    const documents = await prisma.document.findMany({
      where,
      include: {
        koperasi: {
          select: {
            id: true,
            name: true,
            type: true,
            contactPerson: true,
            contactPhone: true,
            contactEmail: true,
            address: true,
          }
        }
      },
      orderBy: { uploadDate: 'desc' },
    });

    return NextResponse.json({ 
      documents,
      total: documents.length 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching RAT documents:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil daftar dokumen RAT' },
      { status: 500 }
    );
  }
}

// PATCH: Update RAT document status (for admin review)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { documentId, status, reviewNotes, reviewedBy } = body;

    if (!documentId || !status) {
      return NextResponse.json(
        { error: 'Document ID dan status diperlukan' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'RESUBMIT'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Update document
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        status,
        reviewNotes,
        reviewedBy,
        reviewDate: new Date(),
      },
      include: {
        koperasi: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
          }
        }
      }
    });

    return NextResponse.json(
      { 
        message: 'Status dokumen RAT berhasil diupdate',
        document 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating RAT document status:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate status dokumen RAT' },
      { status: 500 }
    );
  }
}
