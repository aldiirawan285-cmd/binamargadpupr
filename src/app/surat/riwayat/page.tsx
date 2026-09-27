'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Search, Eye, Download, Trash2, Mail } from 'lucide-react';
import Link from 'next/link';

interface Surat {
  id: string;
  jenis: string;
  nomorSurat: string;
  tanggal: string;
  pengirim: string | null;
  tujuan: string | null;
  perihal: string;
  fileUrl: string | null;
  namaFile: string | null;
  keterangan: string | null;
}

export default function RiwayatSuratPage() {
  const [surat, setSurat] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterTanggalDari, setFilterTanggalDari] = useState('');
  const [filterTanggalSampai, setFilterTanggalSampai] = useState('');

  useEffect(() => {
    fetchSurat();
  }, []);

  const fetchSurat = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterJenis) params.append('jenis', filterJenis);
      if (filterTanggalDari) params.append('dari', filterTanggalDari);
      if (filterTanggalSampai) params.append('sampai', filterTanggalSampai);

      const res = await fetch(`/api/surat?${params}`);
      const data = await res.json();
      setSurat(data);
    } catch (error) {
      console.error('Error fetching surat:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchSurat();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, filterJenis, filterTanggalDari, filterTanggalSampai]);

  const handleDownload = (fileUrl: string, namaFile: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = namaFile || 'file';
    link.target = '_blank';
    link.click();
  };

  return (
    <div>
      <Header title="Riwayat Surat" subtitle="Semua surat masuk dan keluar" />

      <div className="p-6 space-y-6">
        {/* Filter */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nomor surat, perihal, pengirim/tujuan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                placeholder="Semua Jenis"
                options={[
                  { value: 'MASUK', label: 'Surat Masuk' },
                  { value: 'KELUAR', label: 'Surat Keluar' },
                ]}
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
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nomor Surat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pengirim/Tujuan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Perihal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                      </div>
                    </td>
                  </tr>
                ) : surat.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data surat
                    </td>
                  </tr>
                ) : (
                  surat.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.jenis === 'MASUK'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          {item.jenis === 'MASUK' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {item.nomorSurat}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.jenis === 'MASUK' ? item.pengirim : item.tujuan}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                        {item.perihal}
                      </td>
                      <td className="px-4 py-3">
                        {item.fileUrl ? (
                          <button
                            onClick={() => handleDownload(item.fileUrl!, item.namaFile!)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/surat/${item.id}`}>
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
