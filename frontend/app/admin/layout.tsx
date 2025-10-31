"use client";

import { ToastProvider } from '../../components/ui/ToastProvider';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  return (
    <ToastProvider>
      {isLogin ? (
        <div className="bg-white min-h-screen">{children}</div>
      ) : (
        <DashboardLayout>
          {children}
        </DashboardLayout>
      )}
    </ToastProvider>
  )
}
