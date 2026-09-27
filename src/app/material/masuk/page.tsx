'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Plus } from 'lucide-react';

interface Material {
  id: string;
  nama: string;
  satuan: string;
  stokSaatIni: number;
}

export default function MaterialMasukPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [formData, setFormData] = useState({
    materialId: '',
    jumlah: '',
    tanggal: new Date().toISOString().split('T')[0],
    supplier: '',
    keterangan: '',
  });

  const [showNewMaterial, setShowNewMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ nama: '', satuan: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/material')
      .then((res) => res.json())
      .then((data) => setMaterials(data))
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddNewMaterial = async () => {
    if (!newMaterial.nama || !newMaterial.satuan) {
      showToast('error', 'Nama dan satuan material wajib diisi');
      return;
    }

    try {
      const res = await fetch('/api/material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      });

      if (res.ok) {
        const data = await res.json();
        setMaterials((prev) => [...prev, data]);
        setFormData((prev) => ({ ...prev, materialId: data.id }));
        setShowNewMaterial(false);
        setNewMaterial({ nama: '', satuan: '' });
        showToast('success', 'Material baru berhasil ditambahkan');
      }
    } catch (error) {
      showToast('error', 'Gagal menambahkan material');
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.materialId) newErrors.materialId = 'Material wajib dipilih';
    if (!formData.jumlah || parseFloat(formData.jumlah) <= 0) newErrors.jumlah = 'Jumlah wajib diisi';
    if (!formData.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('error', 'Mohon lengkapi semua field wajib');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/material/riwayat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          jenis: 'MASUK',
          jumlah: parseFloat(formData.jumlah),
        }),
      });

      if (res.ok) {
        showToast('success', 'Material masuk berhasil dicatat');
        router.push('/material/stok');
      } else {
        throw new Error('Gagal menyimpan');
      }
    } catch (error) {
      showToast('error', 'Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="Material Masuk" subtitle="Catat pemasukan material ke gudang" />

      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Form Material Masuk</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Select
                  label="Nama Material"
                  name="materialId"
                  options={materials.map((m) => ({
                    value: m.id,
                    label: `${m.nama} (${m.satuan})`,
                  }))}
                  value={formData.materialId}
                  onChange={handleChange}
                  error={errors.materialId}
                  placeholder="Pilih material"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewMaterial(true)}
                  className="mt-1 text-xs text-primary-600 hover:text-primary-700"
                >
                  + Tambah material baru
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Jumlah/Volume"
                  type="number"
                  step="0.01"
                  name="jumlah"
                  value={formData.jumlah}
                  onChange={handleChange}
                  error={errors.jumlah}
                  placeholder="0.00"
                  required
                />
                <Input
                  label="Tanggal Masuk"
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  error={errors.tanggal}
                  required
                />
              </div>

              <Input
                label="Supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="Nama supplier"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Keterangan tambahan..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Menyimpan...' : 'Simpan Material Masuk'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Modal New Material */}
      {showNewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowNewMaterial(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Material Baru</h3>
            <div className="space-y-4">
              <Input
                label="Nama Material"
                placeholder="Contoh: Pasir, Semen, Agregat"
                value={newMaterial.nama}
                onChange={(e) => setNewMaterial((prev) => ({ ...prev, nama: e.target.value }))}
              />
              <Input
                label="Satuan"
                placeholder="Contoh: m³, kg, ton"
                value={newMaterial.satuan}
                onChange={(e) => setNewMaterial((prev) => ({ ...prev, satuan: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleAddNewMaterial} className="flex-1">
                Tambah
              </Button>
              <Button variant="secondary" onClick={() => setShowNewMaterial(false)}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
