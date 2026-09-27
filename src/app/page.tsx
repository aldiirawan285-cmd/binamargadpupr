'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { FileText, Mail, Package, Wrench, TrendingUp, TrendingDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardStats {
  totalLaporan: number;
  totalSuratMasuk: number;
  totalSuratKeluar: number;
  totalMaterial: number;
  alatPakai: number;
  alatRusak: number;
  alatStandby: number;
  progresPerRuas: { ruas: string; progres: number }[];
  trenMaterial: { bulan: string; masuk: number; pakai: number }[];
  jamAlat: { alat: string; jam: number }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Laporan',
      value: stats?.totalLaporan || 0,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+12%',
      isPositive: true,
    },
    {
      title: 'Surat Masuk',
      value: stats?.totalSuratMasuk || 0,
      icon: Mail,
      color: 'bg-green-500',
      change: '+5%',
      isPositive: true,
    },
    {
      title: 'Surat Keluar',
      value: stats?.totalSuratKeluar || 0,
      icon: Mail,
      color: 'bg-purple-500',
      change: '+8%',
      isPositive: true,
    },
    {
      title: 'Jenis Material',
      value: stats?.totalMaterial || 0,
      icon: Package,
      color: 'bg-orange-500',
      change: '-2%',
      isPositive: false,
    },
  ];

  const alatStats = [
    { name: 'Pakai', value: stats?.alatPakai || 0 },
    { name: 'Rusak', value: stats?.alatRusak || 0 },
    { name: 'Standby', value: stats?.alatStandby || 0 },
  ];

  return (
    <div>
      <Header title="Dashboard" subtitle="Ringkasan monitoring pekerjaan konstruksi jalan" />

      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardContent className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {card.isPositive ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span
                        className={`text-xs ${
                          card.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {card.change}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progres per Ruas */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Progres Pekerjaan per Ruas</h3>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.progresPerRuas || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="ruas" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="progres" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Alat */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Status Alat</h3>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={alatStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {alatStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tren Material */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Tren Material (Masuk vs Pakai)</h3>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.trenMaterial || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="masuk"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pakai"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Jam Operasional Alat */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Jam Operasional Alat</h3>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.jamAlat || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="alat" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="jam" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
