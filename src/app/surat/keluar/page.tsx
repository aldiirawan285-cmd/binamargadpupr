'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Upload, FileText } from 'lucide-react';

export default function SuratKeluarPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nomorSurat: '',
    tanggal: new Date().toISOString().split('T')[0],
    tujuan: '',
    perihal: '',
    keterangan: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nomorSurat) newErrors.nomorSurat = 'Nomor surat wajib diisi';
    if (!formData.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';
    if (!formData.tujuan) newErrors.tujuan = 'Tujuan wajib diisi';
    if (!formData.perihal) newErrors.perihal = 'Perihal wajib diisi';
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
      let fileUrl = '';
      let namaFile = '';

      if (file) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('folder', 'surat');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (uploadRes.ok) {
          const data = await uploadRes.json();
          fileUrl = data.url;
          namaFile = file.name;
        }
      }

      const res = await fetch('/api/surat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          jenis: 'KELUAR',
          fileUrl: fileUrl || null,
          namaFile: namaFile || null,
        }),
      });

      if (res.ok) {
        showToast('success', 'Surat keluar berhasil disimpan');
        router.push('/surat/riwayat');
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
      <Header title="Surat Keluar" subtitle="Form input surat keluar" />

      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Informasi Surat Keluar</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nomor Surat"
                  name="nomorSurat"
                  value={formData.nomorSurat}
                  onChange={handleChange}
                  error={errors.nomorSurat}
                  placeholder="Nomor surat"
                  required
                />
                <Input
                  label="Tanggal"
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  error={errors.tanggal}
                  required
                />
              </div>

              <Input
                label="Tujuan"
                name="tujuan"
                value={formData.tujuan}
                onChange={handleChange}
                error={errors.tujuan}
                placeholder="Nama tujuan/instansi"
                required
              />

              <Input
                label="Perihal"
                name="perihal"
                value={formData.perihal}
                onChange={handleChange}
                error={errors.perihal}
                placeholder="Perihal surat"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload File (PDF/Gambar)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {file ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5 text-primary-600" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Klik untuk upload file</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

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
                  {loading ? 'Menyimpan...' : 'Simpan Surat Keluar'}
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
