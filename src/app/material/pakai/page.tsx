'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

interface Material {
  id: string;
  nama: string;
  satuan: string;
  stokSaatIni: number;
}

interface Laporan {
  id: string;
  namaRuasJalan: string;
  jenisPekerjaan: string;
  tanggal: string;
}

export default function MaterialPakaiPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [laporanList, setLaporanList] = useState<Laporan[]>([]);

  const [formData, setFormData] = useState({
    materialId: '',
    jumlah: '',
    tanggal: new Date().toISOString().split('T')[0],
    laporanId: '',
    keterangan: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/material')
      .then((res) => res.json())
      .then((data) => setMaterials(data))
      .catch(console.error);

    fetch('/api/laporan?limit=100')
      .then((res) => res.json())
      .then((data) => setLaporanList(data))
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.materialId) newErrors.materialId = 'Material wajib dipilih';
    if (!formData.jumlah || parseFloat(formData.jumlah) <= 0) newErrors.jumlah = 'Jumlah wajib diisi';
    if (!formData.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';

    // Check stock availability
    const material = materials.find((m) => m.id === formData.materialId);
    if (material && parseFloat(formData.jumlah) > material.stokSaatIni) {
      newErrors.jumlah = `Stok tidak cukup. Tersedia: ${material.stokSaatIni} ${material.satuan}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('error', 'Mohon periksa kembali input Anda');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/material/riwayat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          jenis: 'PAKAI',
          jumlah: parseFloat(formData.jumlah),
        }),
      });

      if (res.ok) {
        showToast('success', 'Material pakai berhasil dicatat');
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
      <Header title="Material Pakai" subtitle="Catat pemakaian material untuk pekerjaan" />

      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Form Material Pakai</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Select
                  label="Nama Material"
                  name="materialId"
                  options={materials.map((m) => ({
                    value: m.id,
                    label: `${m.nama} (Stok: ${m.stokSaatIni} ${m.satuan})`,
                  }))}
                  value={formData.materialId}
                  onChange={handleChange}
                  error={errors.materialId}
                  placeholder="Pilih material"
                  required
                />
                <Link href="/material/stok" className="mt-1 inline-block text-xs text-primary-600 hover:text-primary-700">
                  Lihat stok material
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Jumlah Terpakai"
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
                  label="Tanggal Pakai"
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  error={errors.tanggal}
                  required
                />
              </div>

              <Select
                label="Untuk Pekerjaan (opsional)"
                name="laporanId"
                options={laporanList.map((l) => ({
                  value: l.id,
                  label: `${l.namaRuasJalan} - ${l.jenisPekerjaan} (${new Date(l.tanggal).toLocaleDateString('id-ID')})`,
                }))}
                value={formData.laporanId}
                onChange={handleChange}
                placeholder="Pilih laporan terkait"
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
                  {loading ? 'Menyimpan...' : 'Simpan Material Pakai'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
