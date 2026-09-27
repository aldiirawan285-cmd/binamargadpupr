# RoadMonitor - Monitoring Pekerjaan Konstruksi Jalan

Aplikasi web untuk manajemen dan monitoring pekerjaan konstruksi jalan.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: SQLite (via Prisma ORM)
- **Charts**: Recharts
- **Export**: xlsx (SheetJS), JSZip

## Fitur

1. **Laporan Harian** - Form input dengan upload foto multiple (kompresi otomatis)
2. **Surat Masuk & Keluar** - Manajemen surat dengan upload file
3. **Material Masuk & Pakai** - Tracking stok material otomatis
4. **Jam Pemakaian Alat** - Monitoring status dan jam operasional alat
5. **Dashboard** - Ringkasan statistik dan grafik monitoring
6. **Export** - Download foto (ZIP) dan export data (CSV/Excel)

## Instalasi

```bash
# Install dependencies
npm install

# Setup database
npx prisma db push

# Seed data (opsional)
npm run db:seed

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm start` | Jalankan production server |
| `npm run db:push` | Push schema ke database |
| `npm run db:seed` | Seed data awal |

## Struktur Folder

```
src/
├── app/                    # Halaman & API routes
│   ├── laporan-harian/     # Modul laporan harian
│   ├── surat/              # Modul surat
│   ├── material/           # Modul material
│   ├── alat/               # Modul alat
│   └── api/                # API endpoints
├── components/             # React components
│   ├── layout/             # Sidebar, Header
│   ├── ui/                 # Button, Input, Card, dll
│   └── dashboard/          # Komponen dashboard
├── lib/                    # Utilities
│   ├── prisma.ts           # Prisma client
│   └── validasi.ts         # Schema validasi
└── types/                  # TypeScript types
```

## Database

Database SQLite tersimpan di `prisma/dev.db`. Schema dapat dilihat di `prisma/schema.prisma`.

## Lisensi

MIT
