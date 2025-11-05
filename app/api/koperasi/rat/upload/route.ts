import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST: Upload RAT document
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const koperasiId = formData.get('koperasiId') as string;
    const year = formData.get('year') as string; // Tahun RAT

    if (!file || !koperasiId) {
      return NextResponse.json(
        { error: 'File dan koperasiId diperlukan' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max untuk dokumen RAT)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file harus kurang dari 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Hanya file PDF, JPG, dan PNG yang diperbolehkan' },
        { status: 400 }
      );
    }

    // Verify koperasi exists
    const koperasi = await prisma.koperasi.findUnique({
      where: { id: koperasiId },
      select: { id: true, name: true }
    });

    if (!koperasi) {
      return NextResponse.json(
        { error: 'Koperasi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'rat', koperasiId);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const timestamp = Date.now();
    const yearSuffix = year ? `-${year}` : '';
    const filename = `RAT${yearSuffix}-${timestamp}${fileExtension}`;
    const filepath = path.join(uploadDir, filename);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // Save to database
    const relativePath = `/uploads/rat/${koperasiId}/${filename}`;
    const document = await prisma.document.create({
      data: {
        koperasiId,
        documentType: 'RAT',
        fileName: filename,
        originalName: file.name,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.type,
        status: 'PENDING',
        isRequired: false,
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
        message: 'Dokumen RAT berhasil diupload',
        document 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading RAT document:', error);
    return NextResponse.json(
      { error: 'Gagal mengupload dokumen RAT' },
      { status: 500 }
    );
  }
}
