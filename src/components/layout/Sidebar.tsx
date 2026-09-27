'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Mail,
  Package,
  Wrench,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/laporan-harian', label: 'Dashboard Laporan', icon: FileText },
  { href: '/dashboard/material', label: 'Dashboard Material', icon: Package },
  { href: '/laporan-harian', label: 'Laporan Harian', icon: FileText },
  { href: '/surat/masuk', label: 'Surat Masuk', icon: Mail },
  { href: '/surat/keluar', label: 'Surat Keluar', icon: Mail },
  { href: '/surat/riwayat', label: 'Riwayat Surat', icon: Mail },
  { href: '/material/masuk', label: 'Material Masuk', icon: Package },
  { href: '/material/pakai', label: 'Material Pakai', icon: Package },
  { href: '/material/stok', label: 'Stok Material', icon: Package },
  { href: '/alat', label: 'Alat & Jam Kerja', icon: Wrench },
  { href: '/alat/status', label: 'Status Alat', icon: Wrench },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">RoadMonitor</h1>
            <p className="text-xs text-gray-500">Konstruksi Jalan</p>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-80px)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
