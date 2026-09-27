import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const jenis = searchParams.get('jenis') || '';
    const dari = searchParams.get('dari') || '';
    const sampai = searchParams.get('sampai') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { nomorSurat: { contains: search } },
        { perihal: { contains: search } },
        { pengirim: { contains: search } },
        { tujuan: { contains: search } },
      ];
    }

    if (jenis) where.jenis = jenis;

    if (dari && sampai) {
      where.tanggal = {
        gte: new Date(dari),
        lte: new Date(sampai),
      };
    } else if (dari) {
      where.tanggal = { gte: new Date(dari) };
    } else if (sampai) {
      where.tanggal = { lte: new Date(sampai) };
    }

    const surat = await prisma.surat.findMany({
      where,
      orderBy: { tanggal: 'desc' },
    });

    return NextResponse.json(surat);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch surat' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const surat = await prisma.surat.create({
      data: {
        jenis: body.jenis,
        nomorSurat: body.nomorSurat,
        tanggal: new Date(body.tanggal),
        pengirim: body.pengirim || null,
        tujuan: body.tujuan || null,
        perihal: body.perihal,
        fileUrl: body.fileUrl || null,
        namaFile: body.namaFile || null,
        keterangan: body.keterangan || null,
      },
    });

    return NextResponse.json(surat, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create surat' }, { status: 500 });
  }
}
