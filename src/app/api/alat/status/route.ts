import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const alats = await prisma.alat.findMany({
      include: {
        riwayat: {
          orderBy: { tanggal: 'desc' },
        },
      },
      orderBy: { nama: 'asc' },
    });

    return NextResponse.json(alats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alat status' }, { status: 500 });
  }
}
