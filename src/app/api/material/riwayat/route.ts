import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create riwayat
    const riwayat = await prisma.riwayatMaterial.create({
      data: {
        materialId: body.materialId,
        jenis: body.jenis,
        jumlah: body.jumlah,
        tanggal: new Date(body.tanggal),
        supplier: body.supplier || null,
        laporanId: body.laporanId || null,
        keterangan: body.keterangan || null,
      },
    });

    // Update stok
    const material = await prisma.material.findUnique({
      where: { id: body.materialId },
    });

    if (material) {
      const newStok =
        body.jenis === 'MASUK'
          ? material.stokSaatIni + body.jumlah
          : material.stokSaatIni - body.jumlah;

      await prisma.material.update({
        where: { id: body.materialId },
        data: { stokSaatIni: newStok },
      });
    }

    return NextResponse.json(riwayat, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create riwayat material' }, { status: 500 });
  }
}
