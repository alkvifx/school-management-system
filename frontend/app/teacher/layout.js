'use client';

import { useIsPWA } from '@/src/hooks/useIsPWA';
import DashboardLayout from '@/src/components/layout/DashboardLayout';
import PwaLayout from '@/src/components/layout/PwaLayout';

export default function TeacherLayout({ children }) {
  const isPWA = useIsPWA();
  return (
    <>
      {isPWA ? (
        <PwaLayout>{children}</PwaLayout>
      ) : (
        <DashboardLayout>{children}</DashboardLayout>
      )}
    </>
  );
}
