import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const dari = searchParams.get('dari') || '';
    const sampai = searchParams.get('sampai') || '';
    const ruas = searchParams.get('ruas') || '';
    const jenis = searchParams.get('jenis') || '';

    const where: any = {};

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
      include: { foto: true },
      orderBy: { tanggal: 'desc' },
    });

    // Transform data for export
    const data = laporan.map((l) => ({
      Tanggal: new Date(l.tanggal).toLocaleDateString('id-ID'),
      'Jenis Pekerjaan': l.jenisPekerjaan,
      'Nama Ruas Jalan': l.namaRuasJalan,
      'STA Awal': l.staAwal,
      'STA Akhir': l.staAkhir,
      Sisi: l.sisi,
      'Panjang (m)': l.panjang,
      'Lebar (m)': l.lebar,
      'Tebal (cm)': l.tebal,
      Keterangan: l.keterangan || '',
      'Jumlah Foto': l.foto.length,
      'Foto Progres 0%': l.foto.filter((f) => f.progres === 0).length,
      'Foto Progres 50%': l.foto.filter((f) => f.progres === 50).length,
      'Foto Progres 100%': l.foto.filter((f) => f.progres === 100).length,
    }));

    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Harian');

      // Auto-width columns
      const colWidths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.max(key.length, ...data.map((row: any) => String(row[key] || '').length)) + 2,
      }));
      worksheet['!cols'] = colWidths;

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="laporan-harian-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    } else {
      // CSV
      const worksheet = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(worksheet);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="laporan-harian-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
