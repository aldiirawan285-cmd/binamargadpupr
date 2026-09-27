import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample materials
  const pasir = await prisma.material.upsert({
    where: { id: 'pasir-1' },
    update: {},
    create: {
      id: 'pasir-1',
      nama: 'Pasir',
      satuan: 'm³',
      stokSaatIni: 500,
    },
  });

  const semen = await prisma.material.upsert({
    where: { id: 'semen-1' },
    update: {},
    create: {
      id: 'semen-1',
      nama: 'Semen',
      satuan: 'sak',
      stokSaatIni: 200,
    },
  });

  const agregat = await prisma.material.upsert({
    where: { id: 'agregat-1' },
    update: {},
    create: {
      id: 'agregat-1',
      nama: 'Agregat Kasar',
      satuan: 'm³',
      stokSaatIni: 300,
    },
  });

  // Create sample equipment
  const excavator = await prisma.alat.upsert({
    where: { id: 'alat-1' },
    update: {},
    create: {
      id: 'alat-1',
      nama: 'Excavator CAT 320D',
      statusSaatIni: 'PAKAI',
    },
  });

  const dumpTruck = await prisma.alat.upsert({
    where: { id: 'alat-2' },
    update: {},
    create: {
      id: 'alat-2',
      nama: 'Dump Truck Hino Dutro',
      statusSaatIni: 'STANDBY',
    },
  });

  const vibratorRoller = await prisma.alat.upsert({
    where: { id: 'alat-3' },
    update: {},
    create: {
      id: 'alat-3',
      nama: 'Vibratory Roller Bomag',
      statusSaatIni: 'PAKAI',
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
