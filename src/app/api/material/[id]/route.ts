import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const material = await prisma.material.update({
      where: { id: params.id },
      data: {
        nama: body.nama,
        satuan: body.satuan,
        stokSaatIni: body.stokSaatIni,
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update material' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete related riwayat first
    await prisma.riwayatMaterial.deleteMany({
      where: { materialId: params.id },
    });

    // Delete material
    await prisma.material.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
  }
}
