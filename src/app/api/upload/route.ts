import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'laporan';
    const progres = parseInt(formData.get('progres') as string || '0');
    const ukuranAsli = parseInt(formData.get('ukuranAsli') as string || '0');
    const ukuranKompresi = parseInt(formData.get('ukuranKompresi') as string || '0');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${crypto.randomUUID()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Write file
    await writeFile(filepath, buffer);

    const url = `/uploads/${folder}/${filename}`;

    return NextResponse.json({
      url,
      namaFile: file.name,
      progres,
      ukuranAsli,
      ukuranKompresi,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
