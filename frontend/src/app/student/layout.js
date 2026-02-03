'use client';

import Sidebar from '@/src/components/layout/Sidebar';
import AuthNavbar from '@/src/components/layout/Navbar';

export default function StudentLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AuthNavbar />
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
