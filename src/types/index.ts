export interface LaporanHarian {
  id: string;
  tanggal: string;
  jenisPekerjaan: string;
  namaRuasJalan: string;
  staAwal: number;
  staAkhir: number;
  sisi: string;
  panjang: number;
  lebar: number;
  tebal: number;
  keterangan: string | null;
  foto: Foto[];
  createdAt: string;
  updatedAt: string;
}

export interface Foto {
  id: string;
  laporanId: string;
  url: string;
  progres: number;
  namaFile: string;
  ukuranAsli: number;
  ukuranKompresi: number;
  createdAt: string;
}

export interface Surat {
  id: string;
  jenis: 'MASUK' | 'KELUAR';
  nomorSurat: string;
  tanggal: string;
  pengirim: string | null;
  tujuan: string | null;
  perihal: string;
  fileUrl: string | null;
  namaFile: string | null;
  keterangan: string | null;
  createdAt: string;
}

export interface Material {
  id: string;
  nama: string;
  satuan: string;
  stokSaatIni: number;
  createdAt: string;
}

export interface RiwayatMaterial {
  id: string;
  materialId: string;
  jenis: 'MASUK' | 'PAKAI';
  jumlah: number;
  tanggal: string;
  supplier: string | null;
  laporanId: string | null;
  keterangan: string | null;
  createdAt: string;
}

export interface Alat {
  id: string;
  nama: string;
  statusSaatIni: 'PAKAI' | 'RUSAK' | 'STANDBY';
  createdAt: string;
}

export interface RiwayatAlat {
  id: string;
  alatId: string;
  tanggal: string;
  jamMulai: string | null;
  jamSelesai: string | null;
  totalJam: number | null;
  operator: string | null;
  status: 'PAKAI' | 'RUSAK' | 'STANDBY';
  keteranganKerusakan: string | null;
  createdAt: string;
}
