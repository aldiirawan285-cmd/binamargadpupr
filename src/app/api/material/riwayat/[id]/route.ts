import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Get old riwayat to calculate stock difference
    const oldRiwayat = await prisma.riwayatMaterial.findUnique({
      where: { id: params.id },
      include: { material: true },
    });

    if (!oldRiwayat) {
      return NextResponse.json({ error: 'Riwayat not found' }, { status: 404 });
    }

    // Update riwayat
    const riwayat = await prisma.riwayatMaterial.update({
      where: { id: params.id },
      data: {
        jenis: body.jenis,
        jumlah: body.jumlah,
        tanggal: new Date(body.tanggal),
        supplier: body.supplier || null,
        keterangan: body.keterangan || null,
      },
    });

    // Recalculate stock
    const allRiwayat = await prisma.riwayatMaterial.findMany({
      where: { materialId: oldRiwayat.materialId },
    });

    const totalMasuk = allRiwayat
      .filter((r) => r.jenis === 'MASUK')
      .reduce((sum, r) => sum + r.jumlah, 0);
    const totalPakai = allRiwayat
      .filter((r) => r.jenis === 'PAKAI')
      .reduce((sum, r) => sum + r.jumlah, 0);

    await prisma.material.update({
      where: { id: oldRiwayat.materialId },
      data: { stokSaatIni: totalMasuk - totalPakai },
    });

    return NextResponse.json(riwayat);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update riwayat' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get riwayat to recalculate stock
    const riwayat = await prisma.riwayatMaterial.findUnique({
      where: { id: params.id },
    });

    if (!riwayat) {
      return NextResponse.json({ error: 'Riwayat not found' }, { status: 404 });
    }

    // Delete riwayat
    await prisma.riwayatMaterial.delete({
      where: { id: params.id },
    });

    // Recalculate stock
    const allRiwayat = await prisma.riwayatMaterial.findMany({
      where: { materialId: riwayat.materialId },
    });

    const totalMasuk = allRiwayat
      .filter((r) => r.jenis === 'MASUK')
      .reduce((sum, r) => sum + r.jumlah, 0);
    const totalPakai = allRiwayat
      .filter((r) => r.jenis === 'PAKAI')
      .reduce((sum, r) => sum + r.jumlah, 0);

    await prisma.material.update({
      where: { id: riwayat.materialId },
      data: { stokSaatIni: totalMasuk - totalPakai },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete riwayat' }, { status: 500 });
  }
}
