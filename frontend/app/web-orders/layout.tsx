import { ToastProvider } from '../../components/ui/ToastProvider';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function WebOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ToastProvider>
  );
}

