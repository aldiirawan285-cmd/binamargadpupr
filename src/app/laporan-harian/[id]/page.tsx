'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Download, Calendar, MapPin, Ruler, FileText } from 'lucide-react';
import Link from 'next/link';

interface Foto {
  id: string;
  url: string;
  progres: number;
  namaFile: string;
  ukuranAsli: number;
  ukuranKompresi: number;
}

interface LaporanDetail {
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
}

export default function DetailLaporanPage() {
  const params = useParams();
  const [laporan, setLaporan] = useState<LaporanDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/laporan/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setLaporan(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params.id]);

  const handleDownloadFoto = async () => {
    if (!laporan) return;

    const res = await fetch('/api/download-foto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ laporanIds: [laporan.id] }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `foto-laporan-${laporan.id}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!laporan) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Laporan tidak ditemukan</p>
      </div>
    );
  }

  const fotoProgres0 = laporan.foto.filter((f) => f.progres === 0);
  const fotoProgres50 = laporan.foto.filter((f) => f.progres === 50);
  const fotoProgres100 = laporan.foto.filter((f) => f.progres === 100);

  return (
    <div>
      <Header title="Detail Laporan" subtitle={`Laporan #${laporan.id.slice(0, 8)}`} />

      <div className="p-6 max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/laporan-harian">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex-1" />
          <Button variant="secondary" size="sm" onClick={handleDownloadFoto}>
            <Download className="w-4 h-4 mr-2" />
            Download Foto
          </Button>
        </div>

        {/* Info Utama */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-gray-900">Informasi Laporan</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Tanggal</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(laporan.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Jenis Pekerjaan</p>
                  <p className="text-sm font-medium text-gray-900">{laporan.jenisPekerjaan}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Ruas Jalan</p>
                  <p className="text-sm font-medium text-gray-900">{laporan.namaRuasJalan}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">STA</p>
                  <p className="text-sm font-medium text-gray-900">
                    {laporan.staAwal} - {laporan.staAkhir}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Sisi</p>
                  <p className="text-sm font-medium text-gray-900">{laporan.sisi}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Panjang</p>
                  <p className="text-sm font-medium text-gray-900">{laporan.panjang} m</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lebar</p>
                  <p className="text-sm font-medium text-gray-900">{laporan.lebar} m</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tebal</p>
                  <p className="text-sm font-medium text-gray-900">{laporan.tebal} cm</p>
                </div>
              </div>
            </div>

            {laporan.keterangan && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Keterangan</p>
                <p className="text-sm text-gray-700">{laporan.keterangan}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Foto per Progres */}
        {[
          { title: 'Progres 0%', fotos: fotoProgres0, color: 'bg-gray-500' },
          { title: 'Progres 50%', fotos: fotoProgres50, color: 'bg-yellow-500' },
          { title: 'Progres 100%', fotos: fotoProgres100, color: 'bg-green-500' },
        ].map(
          (group) =>
            group.fotos.length > 0 && (
              <Card key={group.title}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${group.color}`} />
                    <h3 className="text-sm font-semibold text-gray-900">{group.title}</h3>
                    <span className="text-xs text-gray-500">({group.fotos.length} foto)</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {group.fotos.map((foto) => (
                      <div key={foto.id} className="group relative">
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={foto.url}
                            alt={foto.namaFile}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(foto.url, '_blank')}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{foto.namaFile}</p>
                        <p className="text-xs text-gray-400">
                          {(foto.ukuranKompresi / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
        )}
      </div>
    </div>
  );
}
