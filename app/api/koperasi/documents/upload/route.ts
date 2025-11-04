import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET: Fetch all documents for a koperasi
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const koperasiId = searchParams.get('koperasiId');

    if (!koperasiId) {
      return NextResponse.json(
        { error: 'Koperasi ID is required' },
        { status: 400 }
      );
    }

    const documents = await prisma.document.findMany({
      where: { koperasiId },
      orderBy: { uploadDate: 'desc' },
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST: Upload a document
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const koperasiId = formData.get('koperasiId') as string;
    const documentType = formData.get('documentType') as string;

    if (!file || !koperasiId || !documentType) {
      return NextResponse.json(
        { error: 'File, koperasiId, and documentType are required' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF, JPG, and PNG files are allowed' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents', koperasiId);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const timestamp = Date.now();
    const filename = `${documentType}-${timestamp}${fileExtension}`;
    const filepath = path.join(uploadDir, filename);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // Save to database
    const relativePath = `/uploads/documents/${koperasiId}/${filename}`;
    const document = await prisma.document.create({
      data: {
        koperasiId,
        documentType: documentType as any,
        fileName: filename,
        originalName: file.name,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.type,
        status: 'PENDING' as any,
      },
    });

    return NextResponse.json(
      { 
        message: 'Document uploaded successfully',
        document 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
