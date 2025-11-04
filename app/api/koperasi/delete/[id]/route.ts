import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find koperasi with documents
    const koperasi = await prisma.koperasi.findUnique({
      where: { id },
      include: {
        documents: true,
      },
    });

    if (!koperasi) {
      return NextResponse.json(
        { error: 'Koperasi not found' },
        { status: 404 }
      );
    }

    // Only allow deletion if status is DITOLAK
    if (koperasi.status !== ('DITOLAK' as any)) {
      return NextResponse.json(
        { error: 'Only rejected koperasi can be deleted' },
        { status: 400 }
      );
    }

    // Delete all document files from filesystem
    for (const doc of koperasi.documents) {
      const filePath = path.join(process.cwd(), 'public', doc.filePath);
      try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (fileError) {
        // File might not exist, continue
        console.log(`Could not delete file: ${filePath}`, fileError);
      }
    }

    // Delete koperasi from database (cascade will delete documents, activities, members)
    await prisma.koperasi.delete({
      where: { id },
    });

    console.log(`Successfully deleted koperasi: ${id}`);

    return NextResponse.json(
      { 
        message: 'Koperasi and all associated data deleted successfully',
        deletedKoperasiId: id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting koperasi:', error);
    return NextResponse.json(
      { error: 'Failed to delete koperasi' },
      { status: 500 }
    );
  }
}
