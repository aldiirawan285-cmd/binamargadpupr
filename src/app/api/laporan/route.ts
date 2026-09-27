import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const ruas = searchParams.get('ruas') || '';
    const jenis = searchParams.get('jenis') || '';
    const dari = searchParams.get('dari') || '';
    const sampai = searchParams.get('sampai') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { namaRuasJalan: { contains: search } },
        { jenisPekerjaan: { contains: search } },
        { keterangan: { contains: search } },
      ];
    }

    if (ruas) where.namaRuasJalan = ruas;
    if (jenis) where.jenisPekerjaan = jenis;

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

    const laporan = await prisma.laporanHarian.findMany({
      where,
      include: {
        foto: {
          orderBy: { progres: 'asc' },
        },
      },
      orderBy: { tanggal: 'desc' },
    });

    return NextResponse.json(laporan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch laporan' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const laporan = await prisma.laporanHarian.create({
      data: {
        tanggal: new Date(body.tanggal),
        jenisPekerjaan: body.jenisPekerjaan,
        namaRuasJalan: body.namaRuasJalan,
        staAwal: body.staAwal,
        staAkhir: body.staAkhir,
        sisi: body.sisi,
        panjang: body.panjang,
        lebar: body.lebar,
        tebal: body.tebal,
        keterangan: body.keterangan || null,
        foto: {
          create: body.foto.map((f: any) => ({
            url: f.url,
            progres: f.progres,
            namaFile: f.namaFile,
            ukuranAsli: f.ukuranAsli,
            ukuranKompresi: f.ukuranKompresi,
          })),
        },
      },
      include: { foto: true },
    });

    return NextResponse.json(laporan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create laporan' }, { status: 500 });
  }
}
