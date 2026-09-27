import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Total counts
    const totalLaporan = await prisma.laporanHarian.count();
    const totalSuratMasuk = await prisma.surat.count({ where: { jenis: 'MASUK' } });
    const totalSuratKeluar = await prisma.surat.count({ where: { jenis: 'KELUAR' } });
    const totalMaterial = await prisma.material.count();

    // Alat status
    const alatPakai = await prisma.alat.count({ where: { statusSaatIni: 'PAKAI' } });
    const alatRusak = await prisma.alat.count({ where: { statusSaatIni: 'RUSAK' } });
    const alatStandby = await prisma.alat.count({ where: { statusSaatIni: 'STANDBY' } });

    // Progres per ruas (total panjang per ruas)
    const laporan = await prisma.laporanHarian.findMany({
      select: { namaRuasJalan: true, panjang: true },
    });

    const progresMap: Record<string, number> = {};
    laporan.forEach((l) => {
      progresMap[l.namaRuasJalan] = (progresMap[l.namaRuasJalan] || 0) + l.panjang;
    });

    const progresPerRuas = Object.entries(progresMap).map(([ruas, totalPanjang]) => ({
      ruas,
      progres: totalPanjang,
    }));

    // Tren material (6 bulan terakhir)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const riwayatMaterial = await prisma.riwayatMaterial.findMany({
      where: { tanggal: { gte: sixMonthsAgo } },
      select: { jenis: true, jumlah: true, tanggal: true },
    });

    const trenMap: Record<string, { masuk: number; pakai: number }> = {};
    riwayatMaterial.forEach((r) => {
      const month = r.tanggal.toLocaleDateString('id-ID', { month: 'short' });
      if (!trenMap[month]) trenMap[month] = { masuk: 0, pakai: 0 };
      if (r.jenis === 'MASUK') trenMap[month].masuk += r.jumlah;
      else trenMap[month].pakai += r.jumlah;
    });

    const trenMaterial = Object.entries(trenMap).map(([bulan, data]) => ({
      bulan,
      ...data,
    }));

    // Jam operasional alat
    const riwayatAlat = await prisma.riwayatAlat.findMany({
      where: { totalJam: { not: null } },
      include: { alat: true },
    });

    const jamMap: Record<string, number> = {};
    riwayatAlat.forEach((r) => {
      if (r.alat && r.totalJam) {
        jamMap[r.alat.nama] = (jamMap[r.alat.nama] || 0) + r.totalJam;
      }
    });

    const jamAlat = Object.entries(jamMap).map(([alat, jam]) => ({
      alat,
      jam,
    }));

    return NextResponse.json({
      totalLaporan,
      totalSuratMasuk,
      totalSuratKeluar,
      totalMaterial,
      alatPakai,
      alatRusak,
      alatStandby,
      progresPerRuas,
      trenMaterial,
      jamAlat,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard data',
        totalLaporan: 0,
        totalSuratMasuk: 0,
        totalSuratKeluar: 0,
        totalMaterial: 0,
        alatPakai: 0,
        alatRusak: 0,
        alatStandby: 0,
        progresPerRuas: [],
        trenMaterial: [],
        jamAlat: [],
      },
      { status: 200 }
    );
  }
}
