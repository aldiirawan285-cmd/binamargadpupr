'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';

interface FotoPreview {
  file: Blob;
  preview: string;
  progres: number;
  ukuranAsli: number;
  ukuranKompresi: number;
  namaFile: string;
}

export default function FormLaporanPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
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

  const [jenisPekerjaanList, setJenisPekerjaanList] = useState([
    'Pekerjaan Tanah',
    'Pekerjaan Perkerasan',
    'Pekerjaan Drainase',
    'Pekerjaan Jembatan',
    'Pekerjaan Marka Jalan',
    'Pekerjaan Lainnya',
  ]);

  const [showJenisModal, setShowJenisModal] = useState(false);
  const [newJenis, setNewJenis] = useState('');

  const [fotoList, setFotoList] = useState<FotoPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        setFotoList((prev) => [
          ...prev,
          {
            file: compressed.blob,
            preview: compressed.preview,
            progres: 0,
            ukuranAsli: file.size,
            ukuranKompresi: compressed.blob.size,
            namaFile: file.name,
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
    setFotoList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFotoProgres = (index: number, progres: number) => {
    setFotoList((prev) =>
      prev.map((foto, i) => (i === index ? { ...foto, progres } : foto))
    );
  };

  const addJenisPekerjaan = () => {
    if (newJenis.trim() && !jenisPekerjaanList.includes(newJenis.trim())) {
      setJenisPekerjaanList((prev) => [...prev, newJenis.trim()]);
      setFormData((prev) => ({ ...prev, jenisPekerjaan: newJenis.trim() }));
      setNewJenis('');
      setShowJenisModal(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';
    if (!formData.jenisPekerjaan) newErrors.jenisPekerjaan = 'Jenis pekerjaan wajib diisi';
    if (!formData.namaRuasJalan) newErrors.namaRuasJalan = 'Nama ruas jalan wajib diisi';
    if (!formData.staAwal) newErrors.staAwal = 'STA awal wajib diisi';
    if (!formData.staAkhir) newErrors.staAkhir = 'STA akhir wajib diisi';
    if (parseFloat(formData.staAkhir) <= parseFloat(formData.staAwal)) {
      newErrors.staAkhir = 'STA akhir harus lebih besar dari STA awal';
    }
    if (!formData.sisi) newErrors.sisi = 'Sisi wajib dipilih';
    if (!formData.panjang || parseFloat(formData.panjang) <= 0) newErrors.panjang = 'Panjang wajib diisi';
    if (!formData.lebar || parseFloat(formData.lebar) <= 0) newErrors.lebar = 'Lebar wajib diisi';
    if (!formData.tebal || parseFloat(formData.tebal) <= 0) newErrors.tebal = 'Tebal wajib diisi';

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
      // Step 1: Upload foto
      const fotoUrls: { url: string; progres: number; namaFile: string; ukuranAsli: number; ukuranKompresi: number }[] = [];

      for (const foto of fotoList) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', foto.file);
        formDataUpload.append('progres', foto.progres.toString());
        formDataUpload.append('ukuranAsli', foto.ukuranAsli.toString());
        formDataUpload.append('ukuranKompresi', foto.ukuranKompresi.toString());

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (uploadRes.ok) {
          const data = await uploadRes.json();
          fotoUrls.push({
            url: data.url,
            progres: foto.progres,
            namaFile: foto.namaFile,
            ukuranAsli: foto.ukuranAsli,
            ukuranKompresi: foto.ukuranKompresi,
          });
        }
      }

      // Step 2: Simpan laporan
      const laporanRes = await fetch('/api/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          staAwal: parseFloat(formData.staAwal),
          staAkhir: parseFloat(formData.staAkhir),
          panjang: parseFloat(formData.panjang),
          lebar: parseFloat(formData.lebar),
          tebal: parseFloat(formData.tebal),
          foto: fotoUrls,
        }),
      });

      if (laporanRes.ok) {
        showToast('success', 'Laporan berhasil disimpan');
        router.push('/laporan-harian');
      } else {
        throw new Error('Gagal menyimpan laporan');
      }
    } catch (error) {
      showToast('error', 'Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="Tambah Laporan Harian" subtitle="Form input laporan pekerjaan konstruksi" />

      <div className="p-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informasi Dasar */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Informasi Dasar</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Tanggal Laporan"
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  error={errors.tanggal}
                  required
                />
                <div>
                  <Select
                    label="Jenis Pekerjaan"
                    name="jenisPekerjaan"
                    options={jenisPekerjaanList.map((j) => ({ value: j, label: j }))}
                    value={formData.jenisPekerjaan}
                    onChange={handleChange}
                    error={errors.jenisPekerjaan}
                    placeholder="Pilih jenis pekerjaan"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowJenisModal(true)}
                    className="mt-1 text-xs text-primary-600 hover:text-primary-700"
                  >
                    + Tambah jenis pekerjaan baru
                  </button>
                </div>
              </div>

              <Input
                label="Nama Ruas Jalan"
                name="namaRuasJalan"
                value={formData.namaRuasJalan}
                onChange={handleChange}
                error={errors.namaRuasJalan}
                placeholder="Contoh: Jalan Raya Utara"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="STA Awal"
                  type="number"
                  step="0.01"
                  name="staAwal"
                  value={formData.staAwal}
                  onChange={handleChange}
                  error={errors.staAwal}
                  placeholder="0.00"
                  required
                />
                <Input
                  label="STA Akhir"
                  type="number"
                  step="0.01"
                  name="staAkhir"
                  value={formData.staAkhir}
                  onChange={handleChange}
                  error={errors.staAkhir}
                  placeholder="0.00"
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
                  value={formData.sisi}
                  onChange={handleChange}
                  error={errors.sisi}
                  placeholder="Pilih sisi"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Dimensi Pekerjaan */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Dimensi Pekerjaan</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Panjang (meter)"
                  type="number"
                  step="0.01"
                  name="panjang"
                  value={formData.panjang}
                  onChange={handleChange}
                  error={errors.panjang}
                  placeholder="0.00"
                  required
                />
                <Input
                  label="Lebar (meter)"
                  type="number"
                  step="0.01"
                  name="lebar"
                  value={formData.lebar}
                  onChange={handleChange}
                  error={errors.lebar}
                  placeholder="0.00"
                  required
                />
                <Input
                  label="Tebal (cm)"
                  type="number"
                  step="0.01"
                  name="tebal"
                  value={formData.tebal}
                  onChange={handleChange}
                  error={errors.tebal}
                  placeholder="0.00"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Upload Foto */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Foto Pekerjaan</h3>
              <p className="text-xs text-gray-500 mt-1">
                Upload foto dengan progres 0%, 50%, atau 100%. Foto akan dikompresi otomatis.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Klik atau drag foto ke sini</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG (maks. 10MB per foto)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {fotoList.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {fotoList.map((foto, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={foto.preview}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="mt-2">
                        <select
                          value={foto.progres}
                          onChange={(e) => updateFotoProgres(index, parseInt(e.target.value))}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value={0}>Progres 0%</option>
                          <option value={50}>Progres 50%</option>
                          <option value={100}>Progres 100%</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {(foto.ukuranKompresi / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Keterangan */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Keterangan</h3>
            </CardHeader>
            <CardContent>
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Tambahkan keterangan jika ada..."
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
              {loading ? 'Menyimpan...' : 'Simpan Laporan'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Batal
            </Button>
          </div>
        </form>
      </div>

      {/* Modal Tambah Jenis Pekerjaan */}
      {showJenisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowJenisModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Jenis Pekerjaan</h3>
            <Input
              placeholder="Nama jenis pekerjaan baru"
              value={newJenis}
              onChange={(e) => setNewJenis(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <Button onClick={addJenisPekerjaan} className="flex-1">
                Tambah
              </Button>
              <Button variant="secondary" onClick={() => setShowJenisModal(false)}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
