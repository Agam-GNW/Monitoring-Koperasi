import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

// GET: View/Preview RAT document
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;

    // Fetch document from database
    const document = await prisma.document.findUnique({
      where: { id: documentId },
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

    if (!document) {
      return NextResponse.json(
        { error: 'Dokumen tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if it's a RAT document
    if (document.documentType !== 'RAT') {
      return NextResponse.json(
        { error: 'Dokumen bukan tipe RAT' },
        { status: 400 }
      );
    }

    // Read file from disk
    const filepath = path.join(process.cwd(), 'public', document.filePath);
    const fileBuffer = await readFile(filepath);

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `inline; filename="${document.originalName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error viewing RAT document:', error);
    return NextResponse.json(
      { error: 'Gagal menampilkan dokumen RAT' },
      { status: 500 }
    );
  }
}
