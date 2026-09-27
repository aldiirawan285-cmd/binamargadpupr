import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RoadMonitor - Monitoring Konstruksi Jalan',
  description: 'Aplikasi monitoring dan manajemen pekerjaan konstruksi jalan',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main className="lg:ml-64 min-h-screen">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
