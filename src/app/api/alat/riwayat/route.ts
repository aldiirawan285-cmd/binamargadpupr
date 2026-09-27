import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create riwayat
    const riwayat = await prisma.riwayatAlat.create({
      data: {
        alatId: body.alatId,
        tanggal: new Date(body.tanggal),
        jamMulai: body.jamMulai || null,
        jamSelesai: body.jamSelesai || null,
        totalJam: body.totalJam || null,
        operator: body.operator || null,
        status: body.status,
        keteranganKerusakan: body.keteranganKerusakan || null,
      },
    });

    // Update status alat
    await prisma.alat.update({
      where: { id: body.alatId },
      data: { statusSaatIni: body.status },
    });

    return NextResponse.json(riwayat, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create riwayat alat' }, { status: 500 });
  }
}
