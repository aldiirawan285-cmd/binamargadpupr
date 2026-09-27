import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import JSZip from 'jszip';
import path from 'path';
import { readFile } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { laporanIds } = body;

    if (!laporanIds || laporanIds.length === 0) {
      return NextResponse.json({ error: 'No laporan IDs provided' }, { status: 400 });
    }

    const laporan = await prisma.laporanHarian.findMany({
      where: { id: { in: laporanIds } },
      include: { foto: true },
    });

    const zip = new JSZip();

    for (const l of laporan) {
      const folder = zip.folder(l.namaRuasJalan.replace(/\s+/g, '_')) || zip;

      for (const foto of l.foto) {
        const filepath = path.join(process.cwd(), 'public', foto.url);
        try {
          const fileData = await readFile(filepath);
          const ext = path.extname(foto.namaFile);
          const filename = `${foto.progres}%_${foto.namaFile}`;
          folder.file(filename, fileData);
        } catch (e) {
          console.error(`Failed to read file: ${foto.url}`, e);
        }
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="foto-laporan-${new Date().toISOString().split('T')[0]}.zip"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create zip' }, { status: 500 });
  }
}
