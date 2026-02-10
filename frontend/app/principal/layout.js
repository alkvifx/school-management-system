'use client';

import { useIsPWA } from '@/src/hooks/useIsPWA';
import DashboardLayout from '@/src/components/layout/DashboardLayout';
import PwaLayout from '@/src/components/layout/PwaLayout';

export default function PrincipalLayout({ children }) {
  const isPWA = useIsPWA();
  return (
    <div data-theme="principal" className="principal-theme">
      {isPWA ? (
        <PwaLayout>{children}</PwaLayout>
      ) : (
        <DashboardLayout>{children}</DashboardLayout>
      )}
    </div>
  );
}
