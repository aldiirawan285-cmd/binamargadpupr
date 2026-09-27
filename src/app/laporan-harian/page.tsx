'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Plus, Search, Download, Archive, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Laporan {
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
  foto: { id: string; url: string; progres: number; namaFile: string }[];
}

export default function LaporanHarianPage() {
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRuas, setFilterRuas] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterTanggalDari, setFilterTanggalDari] = useState('');
  const [filterTanggalSampai, setFilterTanggalSampai] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterRuas) params.append('ruas', filterRuas);
      if (filterJenis) params.append('jenis', filterJenis);
      if (filterTanggalDari) params.append('dari', filterTanggalDari);
      if (filterTanggalSampai) params.append('sampai', filterTanggalSampai);

      const res = await fetch(`/api/laporan?${params}`);
      const data = await res.json();
      setLaporan(data);
    } catch (error) {
      console.error('Error fetching laporan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchLaporan();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, filterRuas, filterJenis, filterTanggalDari, filterTanggalSampai]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(laporan.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExportCSV = async () => {
    const params = new URLSearchParams();
    if (filterTanggalDari) params.append('dari', filterTanggalDari);
    if (filterTanggalSampai) params.append('sampai', filterTanggalSampai);
    if (filterRuas) params.append('ruas', filterRuas);
    if (filterJenis) params.append('jenis', filterJenis);

    const res = await fetch(`/api/export?${params}&format=csv`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-harian-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    const params = new URLSearchParams();
    if (filterTanggalDari) params.append('dari', filterTanggalDari);
    if (filterTanggalSampai) params.append('sampai', filterTanggalSampai);
    if (filterRuas) params.append('ruas', filterRuas);
    if (filterJenis) params.append('jenis', filterJenis);

    const res = await fetch(`/api/export?${params}&format=xlsx`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-harian-${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadFoto = async () => {
    if (selectedIds.length === 0) return;

    const res = await fetch('/api/download-foto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ laporanIds: selectedIds }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `foto-laporan-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const uniqueRuas = Array.from(new Set(laporan.map((l) => l.namaRuasJalan)));
  const uniqueJenis = Array.from(new Set(laporan.map((l) => l.jenisPekerjaan)));

  return (
    <div>
      <Header title="Laporan Harian" subtitle="Kelola laporan harian pekerjaan konstruksi" />

      <div className="p-6 space-y-6">
        {/* Filter & Actions */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari laporan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/laporan-harian/baru">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Laporan
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                placeholder="Semua Ruas"
                options={uniqueRuas.map((r) => ({ value: r, label: r }))}
                value={filterRuas}
                onChange={(e) => setFilterRuas(e.target.value)}
              />
              <Select
                placeholder="Semua Jenis"
                options={uniqueJenis.map((j) => ({ value: j, label: j }))}
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
              />
              <Input
                type="date"
                placeholder="Dari Tanggal"
                value={filterTanggalDari}
                onChange={(e) => setFilterTanggalDari(e.target.value)}
              />
              <Input
                type="date"
                placeholder="Sampai Tanggal"
                value={filterTanggalSampai}
                onChange={(e) => setFilterTanggalSampai(e.target.value)}
              />
            </div>

            {/* Export Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportExcel}>
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadFoto}
                disabled={selectedIds.length === 0}
              >
                <Archive className="w-4 h-4 mr-2" />
                Download Foto ({selectedIds.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === laporan.length && laporan.length > 0}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Jenis Pekerjaan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ruas Jalan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    STA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dimensi (P×L×T)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Foto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                      </div>
                    </td>
                  </tr>
                ) : laporan.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data laporan
                    </td>
                  </tr>
                ) : (
                  laporan.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleSelectOne(item.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.jenisPekerjaan}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.namaRuasJalan}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.staAwal} - {item.staAkhir}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.panjang}×{item.lebar}×{item.tebal}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex -space-x-2">
                          {item.foto.slice(0, 3).map((foto) => (
                            <img
                              key={foto.id}
                              src={foto.url}
                              alt={foto.namaFile}
                              className="w-8 h-8 rounded-full border-2 border-white object-cover"
                            />
                          ))}
                          {item.foto.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                              +{item.foto.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/laporan-harian/${item.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
