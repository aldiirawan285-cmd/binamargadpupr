'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface MaterialStok {
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

export default function StokMaterialPage() {
  const [materials, setMaterials] = useState<MaterialStok[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/material/stok')
      .then((res) => res.json())
      .then((data) => {
        setMaterials(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStokStatus = (stok: number) => {
    if (stok <= 0) return { label: 'Habis', color: 'bg-red-100 text-red-800' };
    if (stok < 10) return { label: 'Menipis', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Aman', color: 'bg-green-100 text-green-800' };
  };

  const selected = materials.find((m) => m.id === selectedMaterial);

  return (
    <div>
      <Header title="Stok Material" subtitle="Monitoring stok material gudang" />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Jenis Material</p>
                <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Stok Aman</p>
                <p className="text-2xl font-bold text-gray-900">
                  {materials.filter((m) => m.stokSaatIni >= 10).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Stok Menipis/Habis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {materials.filter((m) => m.stokSaatIni < 10).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Material List */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-gray-900">Daftar Stok Material</h3>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Masuk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Pakai
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stok Saat Ini
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                      </div>
                    </td>
                  </tr>
                ) : materials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Belum ada data material
                    </td>
                  </tr>
                ) : (
                  materials.map((material) => {
                    const status = getStokStatus(material.stokSaatIni);
                    return (
                      <tr
                        key={material.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedMaterial(material.id)}
                      >
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
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Riwayat Material */}
        {selected && (
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">
                Riwayat: {selected.nama}
              </h3>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Jenis
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selected.riwayat.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Belum ada riwayat
                      </td>
                    </tr>
                  ) : (
                    selected.riwayat.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(item.tanggal).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.jumlah} {selected.satuan}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.supplier || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.keterangan || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
