import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      include: {
        riwayat: {
          orderBy: { tanggal: 'desc' },
        },
      },
      orderBy: { nama: 'asc' },
    });

    const result = materials.map((m) => {
      const totalMasuk = m.riwayat
        .filter((r) => r.jenis === 'MASUK')
        .reduce((sum, r) => sum + r.jumlah, 0);
      const totalPakai = m.riwayat
        .filter((r) => r.jenis === 'PAKAI')
        .reduce((sum, r) => sum + r.jumlah, 0);

      return {
        id: m.id,
        nama: m.nama,
        satuan: m.satuan,
        stokSaatIni: m.stokSaatIni,
        totalMasuk,
        totalPakai,
        riwayat: m.riwayat,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stok material' }, { status: 500 });
  }
}
