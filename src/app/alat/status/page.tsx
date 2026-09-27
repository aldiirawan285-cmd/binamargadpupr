'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface AlatStatus {
  id: string;
  nama: string;
  statusSaatIni: string;
  riwayat: {
    id: string;
    tanggal: string;
    jamMulai: string | null;
    jamSelesai: string | null;
    totalJam: number | null;
    operator: string | null;
    status: string;
    keteranganKerusakan: string | null;
  }[];
}

export default function StatusAlatPage() {
  const [alats, setAlats] = useState<AlatStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');

  useEffect(() => {
    fetch('/api/alat/status')
      .then((res) => res.json())
      .then((data) => {
        setAlats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAKAI':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'RUSAK':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'STANDBY':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <Wrench className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAKAI':
        return 'bg-green-100 text-green-800';
      case 'RUSAK':
        return 'bg-red-100 text-red-800';
      case 'STANDBY':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlats = alats.filter((alat) => {
    if (filterStatus && alat.statusSaatIni !== filterStatus) return false;
    return true;
  });

  const summary = {
    total: alats.length,
    pakai: alats.filter((a) => a.statusSaatIni === 'PAKAI').length,
    rusak: alats.filter((a) => a.statusSaatIni === 'RUSAK').length,
    standby: alats.filter((a) => a.statusSaatIni === 'STANDBY').length,
  };

  return (
    <div>
      <Header title="Status Alat" subtitle="Monitoring status dan riwayat alat berat" />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="text-center">
              <Wrench className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              <p className="text-xs text-gray-500">Total Alat</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{summary.pakai}</p>
              <p className="text-xs text-gray-500">Pakai</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{summary.rusak}</p>
              <p className="text-xs text-gray-500">Rusak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-600">{summary.standby}</p>
              <p className="text-xs text-gray-500">Standby</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select
                placeholder="Semua Status"
                options={[
                  { value: 'PAKAI', label: 'Pakai' },
                  { value: 'RUSAK', label: 'Rusak' },
                  { value: 'STANDBY', label: 'Standby' },
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                type="date"
                placeholder="Filter Tanggal"
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Alat List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                </div>
              </CardContent>
            </Card>
          ) : filteredAlats.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Tidak ada data alat
              </CardContent>
            </Card>
          ) : (
            filteredAlats.map((alat) => (
              <Card key={alat.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(alat.statusSaatIni)}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{alat.nama}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                            alat.statusSaatIni
                          )}`}
                        >
                          {alat.statusSaatIni}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {alat.riwayat.length === 0 ? (
                    <p className="text-sm text-gray-500">Belum ada riwayat</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                              Tanggal
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                              Jam
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                              Operator
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                              Keterangan
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {alat.riwayat
                            .filter((r) => {
                              if (!filterTanggal) return true;
                              return new Date(r.tanggal).toISOString().split('T')[0] === filterTanggal;
                            })
                            .map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-sm text-gray-900">
                                  {new Date(item.tanggal).toLocaleDateString('id-ID')}
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                                      item.status
                                    )}`}
                                  >
                                    {item.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900">
                                  {item.totalJam
                                    ? `${item.totalJam} jam`
                                    : item.jamMulai && item.jamSelesai
                                    ? `${item.jamMulai} - ${item.jamSelesai}`
                                    : '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900">
                                  {item.operator || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-500">
                                  {item.keteranganKerusakan || '-'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
