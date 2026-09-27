import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const alats = await prisma.alat.findMany({
      orderBy: { nama: 'asc' },
    });
    return NextResponse.json(alats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const alat = await prisma.alat.create({
      data: {
        nama: body.nama,
      },
    });
    return NextResponse.json(alat, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create alat' }, { status: 500 });
  }
}
