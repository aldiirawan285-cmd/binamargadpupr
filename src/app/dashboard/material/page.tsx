'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Edit2, Trash2, Search, Package, TrendingUp, TrendingDown } from 'lucide-react';

interface Material {
  id: string;
  nama: string;
  satuan: string;
  stokSaatIni: number;
  totalMasuk: number;
  totalPakai: number;
  riwayat: {
    id: string;
    jenis: string;
    jumlah: number;
    tanggal: string;
    supplier: string | null;
    keterangan: string | null;
  }[];
}

interface EditMaterial {
  id: string;
  nama: string;
  satuan: string;
  stokSaatIni: number;
}

export default function DashboardMaterialPage() {
  const { showToast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingMaterial, setEditingMaterial] = useState<EditMaterial | null>(null);
  const [editingRiwayat, setEditingRiwayat] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRiwayatModal, setShowRiwayatModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ nama: '', satuan: '', stokSaatIni: '' });
  const [riwayatFormData, setRiwayatFormData] = useState({
    jenis: 'MASUK',
    jumlah: '',
    tanggal: '',
    supplier: '',
    keterangan: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetch(`/api/material/stok?${params}`);
      const data = await res.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchMaterials();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setEditFormData({
      nama: material.nama,
      satuan: material.satuan,
      stokSaatIni: material.stokSaatIni.toString(),
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveMaterial = async () => {
    const newErrors: Record<string, string> = {};
    if (!editFormData.nama) newErrors.nama = 'Nama material wajib diisi';
    if (!editFormData.satuan) newErrors.satuan = 'Satuan wajib diisi';
    if (!editFormData.stokSaatIni) newErrors.stokSaatIni = 'Stok wajib diisi';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await fetch(`/api/material/${editingMaterial?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: editFormData.nama,
          satuan: editFormData.satuan,
          stokSaatIni: parseFloat(editFormData.stokSaatIni),
        }),
      });

      if (res.ok) {
        showToast('success', 'Material berhasil diperbarui');
        setShowEditModal(false);
        fetchMaterials();
      } else {
        throw new Error('Gagal memperbarui');
      }
    } catch (error) {
      showToast('error', 'Terjadi kesalahan saat memperbarui');
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus material ini?')) return;

    try {
      const res = await fetch(`/api/material/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Material berhasil dihapus');
        fetchMaterials();
      }
    } catch (error) {
      showToast('error', 'Gagal menghapus material');
    }
  };

  const handleEditRiwayat = (riwayat: any) => {
    setEditingRiwayat(riwayat);
    setRiwayatFormData({
      jenis: riwayat.jenis,
      jumlah: riwayat.jumlah.toString(),
      tanggal: new Date(riwayat.tanggal).toISOString().split('T')[0],
      supplier: riwayat.supplier || '',
      keterangan: riwayat.keterangan || '',
    });
    setErrors({});
    setShowRiwayatModal(true);
  };

  const handleRiwayatChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRiwayatFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveRiwayat = async () => {
    const newErrors: Record<string, string> = {};
    if (!riwayatFormData.jumlah || parseFloat(riwayatFormData.jumlah) <= 0) {
      newErrors.jumlah = 'Jumlah wajib diisi';
    }
    if (!riwayatFormData.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await fetch(`/api/material/riwayat/${editingRiwayat?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis: riwayatFormData.jenis,
          jumlah: parseFloat(riwayatFormData.jumlah),
          tanggal: riwayatFormData.tanggal,
          supplier: riwayatFormData.supplier || null,
          keterangan: riwayatFormData.keterangan || null,
        }),
      });

      if (res.ok) {
        showToast('success', 'Riwayat material berhasil diperbarui');
        setShowRiwayatModal(false);
        fetchMaterials();
      } else {
        throw new Error('Gagal memperbarui');
      }
    } catch (error) {
      showToast('error', 'Terjadi kesalahan saat memperbarui');
    }
  };

  const handleDeleteRiwayat = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) return;

    try {
      const res = await fetch(`/api/material/riwayat/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Riwayat berhasil dihapus');
        fetchMaterials();
      }
    } catch (error) {
      showToast('error', 'Gagal menghapus riwayat');
    }
  };

  return (
    <div>
      <Header title="Dashboard Material" subtitle="Monitoring stok dan riwayat material" />

      <div className="p-6 space-y-6">
        {/* Filter */}
        <Card>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari material..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Material List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Masuk</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pakai</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stok Saat Ini</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                      </div>
                    </td>
                  </tr>
                ) : materials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data material
                    </td>
                  </tr>
                ) : (
                  materials.map((material) => {
                    const stokStatus =
                      material.stokSaatIni <= 0
                        ? { label: 'Habis', color: 'bg-red-100 text-red-800' }
                        : material.stokSaatIni < 10
                        ? { label: 'Menipis', color: 'bg-yellow-100 text-yellow-800' }
                        : { label: 'Aman', color: 'bg-green-100 text-green-800' };

                    return (
                      <tr key={material.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{material.nama}</p>
                              <p className="text-xs text-gray-500">Satuan: {material.satuan}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {material.totalMasuk} {material.satuan}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {material.totalPakai} {material.satuan}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold text-gray-900">
                            {material.stokSaatIni} {material.satuan}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stokStatus.color}`}
                          >
                            {stokStatus.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMaterial(material)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Riwayat per Material */}
        {materials.map((material) => (
          <Card key={material.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Riwayat: {material.nama}
                </h3>
                <span className="text-xs text-gray-500">
                  {material.riwayat.length} transaksi
                </span>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Jenis</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Keterangan</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {material.riwayat.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                        Belum ada riwayat
                      </td>
                    </tr>
                  ) : (
                    material.riwayat.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(item.tanggal).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.jenis === 'MASUK'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.jenis === 'MASUK' ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {item.jenis}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.jumlah} {material.satuan}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.supplier || '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {item.keterangan || '-'}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRiwayat(item)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRiwayat(item.id)}
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
        ))}
      </div>

      {/* Edit Material Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Material"
      >
        <div className="space-y-4">
          <Input
            label="Nama Material"
            name="nama"
            value={editFormData.nama}
            onChange={handleEditChange}
            error={errors.nama}
            required
          />
          <Input
            label="Satuan"
            name="satuan"
            value={editFormData.satuan}
            onChange={handleEditChange}
            error={errors.satuan}
            placeholder="Contoh: m³, kg, ton"
            required
          />
          <Input
            label="Stok Saat Ini"
            type="number"
            step="0.01"
            name="stokSaatIni"
            value={editFormData.stokSaatIni}
            onChange={handleEditChange}
            error={errors.stokSaatIni}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveMaterial} className="flex-1">
              Simpan Perubahan
            </Button>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Batal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Riwayat Modal */}
      <Modal
        isOpen={showRiwayatModal}
        onClose={() => setShowRiwayatModal(false)}
        title="Edit Riwayat Material"
      >
        <div className="space-y-4">
          <Select
            label="Jenis"
            name="jenis"
            options={[
              { value: 'MASUK', label: 'Masuk' },
              { value: 'PAKAI', label: 'Pakai' },
            ]}
            value={riwayatFormData.jenis}
            onChange={handleRiwayatChange}
            required
          />
          <Input
            label="Jumlah"
            type="number"
            step="0.01"
            name="jumlah"
            value={riwayatFormData.jumlah}
            onChange={handleRiwayatChange}
            error={errors.jumlah}
            required
          />
          <Input
            label="Tanggal"
            type="date"
            name="tanggal"
            value={riwayatFormData.tanggal}
            onChange={handleRiwayatChange}
            error={errors.tanggal}
            required
          />
          <Input
            label="Supplier"
            name="supplier"
            value={riwayatFormData.supplier}
            onChange={handleRiwayatChange}
            placeholder="Nama supplier"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
            <textarea
              name="keterangan"
              value={riwayatFormData.keterangan}
              onChange={handleRiwayatChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Keterangan tambahan..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveRiwayat} className="flex-1">
              Simpan Perubahan
            </Button>
            <Button variant="secondary" onClick={() => setShowRiwayatModal(false)}>
              Batal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
