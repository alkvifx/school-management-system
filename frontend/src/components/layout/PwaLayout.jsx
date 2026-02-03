'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/src/context/auth.context';
import { cn } from '@/lib/utils';
import BottomNav from './BottomNav';

// Smooth page transition for app-like feel
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/**
 * PWA-only layout: full height, no top header, fixed bottom nav.
 * Content area has safe-area padding and space for bottom nav.
 * Bottom nav is hidden on login (caller ensures this is only used for authenticated routes).
 */
export default function PwaLayout({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide bottom nav on login/auth pages (defensive)
  const isLoginScreen =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email';
  const showBottomNav = !!user && !isLoginScreen;

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] bg-gray-50 dark:bg-gray-950">
      {/* Main content: full height with safe areas and bottom nav spacing */}
      <main
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden',
          'pt-[env(safe-area-inset-top)]',
          showBottomNav
            ? 'pb-[calc(env(safe-area-inset-bottom)+4.5rem)]' // safe area + bottom nav height
            : 'pb-[env(safe-area-inset-bottom)]'
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="p-4 sm:p-5 min-h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fixed bottom navigation (PWA only, when authenticated, not on login) */}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
