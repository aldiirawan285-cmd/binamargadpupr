import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const laporan = await prisma.laporanHarian.findUnique({
      where: { id: params.id },
      include: { foto: true },
    });

    if (!laporan) {
      return NextResponse.json({ error: 'Laporan not found' }, { status: 404 });
    }

    return NextResponse.json(laporan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch laporan' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Delete existing fotos that are not in the new list
    const existingFotoIds = body.foto
      .filter((f: any) => f.id)
      .map((f: any) => f.id);

    await prisma.foto.deleteMany({
      where: {
        laporanId: params.id,
        id: { notIn: existingFotoIds },
      },
    });

    // Update or create fotos
    for (const foto of body.foto) {
      if (foto.id) {
        // Update existing foto
        await prisma.foto.update({
          where: { id: foto.id },
          data: {
            progres: foto.progres,
            url: foto.url,
            namaFile: foto.namaFile,
          },
        });
      } else {
        // Create new foto
        await prisma.foto.create({
          data: {
            laporanId: params.id,
            url: foto.url,
            progres: foto.progres,
            namaFile: foto.namaFile,
            ukuranAsli: foto.ukuranAsli || 0,
            ukuranKompresi: foto.ukuranKompresi || 0,
          },
        });
      }
    }

    // Update laporan
    const laporan = await prisma.laporanHarian.update({
      where: { id: params.id },
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
      },
      include: { foto: true },
    });

    return NextResponse.json(laporan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update laporan' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete related fotos first
    await prisma.foto.deleteMany({
      where: { laporanId: params.id },
    });

    // Delete laporan
    await prisma.laporanHarian.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete laporan' }, { status: 500 });
  }
}
