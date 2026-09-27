'use client';

import { useEffect, useState, useRef } from 'react';
import Header from '@/components/layout/Header';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Edit2, Trash2, Plus, Search, Download, Archive, X, Upload } from 'lucide-react';

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

interface FotoItem {
  id?: string;
  file?: Blob;
  preview: string;
  progres: number;
  url?: string;
  namaFile: string;
  ukuranAsli?: number;
  ukuranKompresi?: number;
  isNew: boolean;
}

export default function DashboardLaporanPage() {
  const { showToast } = useToast();
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRuas, setFilterRuas] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingLaporan, setEditingLaporan] = useState<Laporan | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editFormData, setEditFormData] = useState({
    tanggal: '',
    jenisPekerjaan: '',
    namaRuasJalan: '',
    staAwal: '',
    staAkhir: '',
    sisi: '',
    panjang: '',
    lebar: '',
    tebal: '',
    keterangan: '',
  });
  const [editFotos, setEditFotos] = useState<FotoItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const jenisPekerjaanList = [
    'Pekerjaan Tanah',
    'Pekerjaan Perkerasan',
    'Pekerjaan Drainase',
    'Pekerjaan Jembatan',
    'Pekerjaan Marka Jalan',
    'Pekerjaan Lainnya',
  ];

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterRuas) params.append('ruas', filterRuas);
      if (filterJenis) params.append('jenis', filterJenis);

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
  }, [search, filterRuas, filterJenis]);

  const handleEdit = (item: Laporan) => {
    setEditingLaporan(item);
    setEditFormData({
      tanggal: new Date(item.tanggal).toISOString().split('T')[0],
      jenisPekerjaan: item.jenisPekerjaan,
      namaRuasJalan: item.namaRuasJalan,
      staAwal: item.staAwal.toString(),
      staAkhir: item.staAkhir.toString(),
      sisi: item.sisi,
      panjang: item.panjang.toString(),
      lebar: item.lebar.toString(),
      tebal: item.tebal.toString(),
      keterangan: item.keterangan || '',
    });
    setEditFotos(
      item.foto.map((f) => ({
        id: f.id,
        url: f.url,
        preview: f.url,
        progres: f.progres,
        namaFile: f.namaFile,
        isNew: false,
      }))
    );
    setErrors({});
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showToast('error', `File ${file.name} bukan gambar`);
        continue;
      }

      try {
        const compressed = await compressImage(file);
        setEditFotos((prev) => [
          ...prev,
          {
            file: compressed.blob,
            preview: compressed.preview,
            progres: 0,
            namaFile: file.name,
            ukuranAsli: file.size,
            ukuranKompresi: compressed.blob.size,
            isNew: true,
          },
        ]);
      } catch (error) {
        showToast('error', `Gagal memproses ${file.name}`);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const compressImage = (file: File): Promise<{ blob: Blob; preview: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxWidth = 1200;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              resolve({ blob, preview: URL.createObjectURL(blob) });
            } else {
              reject(new Error('Kompresi gagal'));
            }
          },
          'image/jpeg',
          0.75
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Gagal memuat gambar'));
      };
    });
  };

  const removeFoto = (index: number) => {
    setEditFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFotoProgres = (index: number, progres: number) => {
    setEditFotos((prev) =>
      prev.map((foto, i) => (i === index ? { ...foto, progres } : foto))
    );
  };

  const validateEdit = () => {
    const newErrors: Record<string, string> = {};
    if (!editFormData.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';
    if (!editFormData.jenisPekerjaan) newErrors.jenisPekerjaan = 'Jenis pekerjaan wajib diisi';
    if (!editFormData.namaRuasJalan) newErrors.namaRuasJalan = 'Nama ruas jalan wajib diisi';
    if (!editFormData.staAwal) newErrors.staAwal = 'STA awal wajib diisi';
    if (!editFormData.staAkhir) newErrors.staAkhir = 'STA akhir wajib diisi';
    if (parseFloat(editFormData.staAkhir) <= parseFloat(editFormData.staAwal)) {
      newErrors.staAkhir = 'STA akhir harus lebih besar dari STA awal';
    }
    if (!editFormData.sisi) newErrors.sisi = 'Sisi wajib dipilih';
    if (!editFormData.panjang || parseFloat(editFormData.panjang) <= 0) newErrors.panjang = 'Panjang wajib diisi';
    if (!editFormData.lebar || parseFloat(editFormData.lebar) <= 0) newErrors.lebar = 'Lebar wajib diisi';
    if (!editFormData.tebal || parseFloat(editFormData.tebal) <= 0) newErrors.tebal = 'Tebal wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateEdit()) {
      showToast('error', 'Mohon lengkapi semua field wajib');
      return;
    }

    try {
      // Upload new fotos first
      const fotoData: any[] = [...editFotos.filter((f) => !f.isNew).map((f) => ({
        id: f.id,
        url: f.url,
        progres: f.progres,
        namaFile: f.namaFile,
      }))];

      for (const foto of editFotos.filter((f) => f.isNew)) {
        if (foto.file) {
          const formDataUpload = new FormData();
          formDataUpload.append('file', foto.file);
          formDataUpload.append('progres', foto.progres.toString());
          formDataUpload.append('ukuranAsli', foto.ukuranAsli?.toString() || '0');
          formDataUpload.append('ukuranKompresi', foto.ukuranKompresi?.toString() || '0');

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formDataUpload,
          });

          if (uploadRes.ok) {
            const data = await uploadRes.json();
            fotoData.push({
              url: data.url,
              progres: foto.progres,
              namaFile: foto.namaFile,
            });
          }
        }
      }

      const res = await fetch(`/api/laporan/${editingLaporan?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          staAwal: parseFloat(editFormData.staAwal),
          staAkhir: parseFloat(editFormData.staAkhir),
          panjang: parseFloat(editFormData.panjang),
          lebar: parseFloat(editFormData.lebar),
          tebal: parseFloat(editFormData.tebal),
          foto: fotoData,
        }),
      });

      if (res.ok) {
        showToast('success', 'Laporan berhasil diperbarui');
        setShowEditModal(false);
        fetchLaporan();
      } else {
        throw new Error('Gagal memperbarui');
      }
    } catch (error) {
      showToast('error', 'Terjadi kesalahan saat memperbarui');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan ini?')) return;

    try {
      const res = await fetch(`/api/laporan/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Laporan berhasil dihapus');
        fetchLaporan();
      }
    } catch (error) {
      showToast('error', 'Gagal menghapus laporan');
    }
  };

  const handleExportCSV = async () => {
    const res = await fetch('/api/export?format=csv');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-harian-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    const res = await fetch('/api/export?format=xlsx');
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
      <Header title="Dashboard Laporan Harian" subtitle="Monitoring dan kelola laporan pekerjaan konstruksi" />

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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

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
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(laporan.map((l) => l.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      checked={selectedIds.length === laporan.length && laporan.length > 0}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jenis Pekerjaan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ruas Jalan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">STA</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dimensi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Foto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
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
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((i) => i !== item.id)
                                : [...prev, item.id]
                            )
                          }
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.jenisPekerjaan}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.namaRuasJalan}</td>
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
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
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

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Laporan Harian"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tanggal Laporan"
              type="date"
              name="tanggal"
              value={editFormData.tanggal}
              onChange={handleEditChange}
              error={errors.tanggal}
              required
            />
            <Select
              label="Jenis Pekerjaan"
              name="jenisPekerjaan"
              options={jenisPekerjaanList.map((j) => ({ value: j, label: j }))}
              value={editFormData.jenisPekerjaan}
              onChange={handleEditChange}
              error={errors.jenisPekerjaan}
              required
            />
          </div>

          <Input
            label="Nama Ruas Jalan"
            name="namaRuasJalan"
            value={editFormData.namaRuasJalan}
            onChange={handleEditChange}
            error={errors.namaRuasJalan}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="STA Awal"
              type="number"
              step="0.01"
              name="staAwal"
              value={editFormData.staAwal}
              onChange={handleEditChange}
              error={errors.staAwal}
              required
            />
            <Input
              label="STA Akhir"
              type="number"
              step="0.01"
              name="staAkhir"
              value={editFormData.staAkhir}
              onChange={handleEditChange}
              error={errors.staAkhir}
              required
            />
            <Select
              label="Sisi"
              name="sisi"
              options={[
                { value: 'Kiri', label: 'Kiri' },
                { value: 'Kanan', label: 'Kanan' },
                { value: 'Tengah', label: 'Tengah' },
              ]}
              value={editFormData.sisi}
              onChange={handleEditChange}
              error={errors.sisi}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Panjang (meter)"
              type="number"
              step="0.01"
              name="panjang"
              value={editFormData.panjang}
              onChange={handleEditChange}
              error={errors.panjang}
              required
            />
            <Input
              label="Lebar (meter)"
              type="number"
              step="0.01"
              name="lebar"
              value={editFormData.lebar}
              onChange={handleEditChange}
              error={errors.lebar}
              required
            />
            <Input
              label="Tebal (cm)"
              type="number"
              step="0.01"
              name="tebal"
              value={editFormData.tebal}
              onChange={handleEditChange}
              error={errors.tebal}
              required
            />
          </div>

          {/* Foto Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto Pekerjaan</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-400 transition-colors mb-4"
            >
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Tambah foto baru</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {editFotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {editFotos.map((foto, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={foto.preview}
                        alt={foto.namaFile}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFoto(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <select
                      value={foto.progres}
                      onChange={(e) => updateFotoProgres(index, parseInt(e.target.value))}
                      className="w-full mt-1 text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value={0}>Progres 0%</option>
                      <option value={50}>Progres 50%</option>
                      <option value={100}>Progres 100%</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
            <textarea
              name="keterangan"
              value={editFormData.keterangan}
              onChange={handleEditChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Keterangan tambahan..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveEdit} className="flex-1">
              Simpan Perubahan
            </Button>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Batal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
