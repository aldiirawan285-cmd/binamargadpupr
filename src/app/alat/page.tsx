'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Plus, Clock, User } from 'lucide-react';

interface Alat {
  id: string;
  nama: string;
  statusSaatIni: string;
}

export default function AlatPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [alats, setAlats] = useState<Alat[]>([]);

  const [formData, setFormData] = useState({
    alatId: '',
    tanggal: new Date().toISOString().split('T')[0],
    jamMulai: '',
    jamSelesai: '',
    totalJam: '',
    operator: '',
    status: 'PAKAI',
    keteranganKerusakan: '',
  });

  const [showNewAlat, setShowNewAlat] = useState(false);
  const [newAlatNama, setNewAlatNama] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/alat')
      .then((res) => res.json())
      .then((data) => setAlats(data))
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Auto-calculate total jam
    if (name === 'jamMulai' || name === 'jamSelesai') {
      const jamMulai = name === 'jamMulai' ? value : formData.jamMulai;
      const jamSelesai = name === 'jamSelesai' ? value : formData.jamSelesai;
      if (jamMulai && jamSelesai) {
        const [h1, m1] = jamMulai.split(':').map(Number);
        const [h2, m2] = jamSelesai.split(':').map(Number);
        const diff = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
        if (diff > 0) {
          setFormData((prev) => ({ ...prev, totalJam: diff.toFixed(2) }));
        }
      }
    }
  };

  const handleAddNewAlat = async () => {
    if (!newAlatNama.trim()) {
      showToast('error', 'Nama alat wajib diisi');
      return;
    }

    try {
      const res = await fetch('/api/alat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: newAlatNama }),
      });

      if (res.ok) {
        const data = await res.json();
        setAlats((prev) => [...prev, data]);
        setFormData((prev) => ({ ...prev, alatId: data.id }));
        setShowNewAlat(false);
        setNewAlatNama('');
        showToast('success', 'Alat baru berhasil ditambahkan');
      }
    } catch (error) {
      showToast('error', 'Gagal menambahkan alat');
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.alatId) newErrors.alatId = 'Alat wajib dipilih';
    if (!formData.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';
    if (!formData.operator) newErrors.operator = 'Operator wajib diisi';
    if (!formData.status) newErrors.status = 'Status wajib dipilih';

    if (formData.status === 'RUSAK' && !formData.keteranganKerusakan) {
      newErrors.keteranganKerusakan = 'Keterangan kerusakan wajib diisi';
    }

    if (formData.status === 'PAKAI') {
      if (!formData.jamMulai && !formData.totalJam) {
        newErrors.jamMulai = 'Jam mulai atau total jam wajib diisi';
      }
    }

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
      const res = await fetch('/api/alat/riwayat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalJam: formData.totalJam ? parseFloat(formData.totalJam) : null,
        }),
      });

      if (res.ok) {
        showToast('success', 'Data alat berhasil disimpan');
        router.push('/alat/status');
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
      <Header title="Jam Pemakaian Alat" subtitle="Catat jam operasional alat berat" />

      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Form Jam Operasional Alat</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Select
                  label="Nama Alat/Unit"
                  name="alatId"
                  options={alats.map((a) => ({
                    value: a.id,
                    label: `${a.nama} (${a.statusSaatIni})`,
                  }))}
                  value={formData.alatId}
                  onChange={handleChange}
                  error={errors.alatId}
                  placeholder="Pilih alat"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewAlat(true)}
                  className="mt-1 text-xs text-primary-600 hover:text-primary-700"
                >
                  + Tambah alat baru
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Tanggal"
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  error={errors.tanggal}
                  required
                />
                <Select
                  label="Status Alat"
                  name="status"
                  options={[
                    { value: 'PAKAI', label: 'Pakai' },
                    { value: 'RUSAK', label: 'Rusak' },
                    { value: 'STANDBY', label: 'Standby' },
                  ]}
                  value={formData.status}
                  onChange={handleChange}
                  error={errors.status}
                  required
                />
              </div>

              {formData.status === 'PAKAI' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Jam Mulai"
                    type="time"
                    name="jamMulai"
                    value={formData.jamMulai}
                    onChange={handleChange}
                    error={errors.jamMulai}
                  />
                  <Input
                    label="Jam Selesai"
                    type="time"
                    name="jamSelesai"
                    value={formData.jamSelesai}
                    onChange={handleChange}
                  />
                  <Input
                    label="Total Jam"
                    type="number"
                    step="0.01"
                    name="totalJam"
                    value={formData.totalJam}
                    onChange={handleChange}
                    placeholder="Auto"
                  />
                </div>
              )}

              <Input
                label="Operator"
                name="operator"
                value={formData.operator}
                onChange={handleChange}
                error={errors.operator}
                placeholder="Nama operator"
                required
              />

              {formData.status === 'RUSAK' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keterangan Kerusakan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="keteranganKerusakan"
                    value={formData.keteranganKerusakan}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.keteranganKerusakan ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Jelaskan kerusakan yang terjadi..."
                  />
                  {errors.keteranganKerusakan && (
                    <p className="mt-1 text-xs text-red-600">{errors.keteranganKerusakan}</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Menyimpan...' : 'Simpan Data Alat'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Modal New Alat */}
      {showNewAlat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowNewAlat(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Alat Baru</h3>
            <Input
              label="Nama Alat/Unit"
              placeholder="Contoh: Excavator CAT 320D"
              value={newAlatNama}
              onChange={(e) => setNewAlatNama(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <Button onClick={handleAddNewAlat} className="flex-1">
                Tambah
              </Button>
              <Button variant="secondary" onClick={() => setShowNewAlat(false)}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
