'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Menu } from 'lucide-react';
import { useAuth } from '../../context/auth.context';
import { NotificationDropdown } from '../NotificationDropdown';
import { NoticeDropdown } from '../NoticeDropdown';
import { ROLES } from '../../utils/constants';
import { motion } from 'framer-motion';
import { usePwaInstall } from '@/src/hooks/usePwaInstall';

export default function AuthNavbar({ onMenuClick }) {
  const { user } = useAuth();
  const {
    isInstalled,
    supportsPrompt,
    iosSafariNeedsManualSteps,
    promptInstall,
    iosGuideOpen,
    closeIosGuide,
  } = usePwaInstall();
  const showNotifications = user?.role === ROLES.TEACHER || user?.role === ROLES.STUDENT;
  const showNotices = user?.role === ROLES.TEACHER || user?.role === ROLES.STUDENT;

  const profileImageUrl = user?.profileImage?.url || null;
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const showInstallButton = !isInstalled && supportsPrompt;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - Show only when onMenuClick is provided */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Welcome back, {user?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {showInstallButton && (
              <button
                type="button"
                onClick={promptInstall}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                aria-label="Install App"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}
            {showNotifications && <NotificationDropdown />}
            {showNotices && <NoticeDropdown />}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.toLowerCase().replace('_', ' ')}
              </p>
            </div>
            <Link href="/profile">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                style={{
                  background: profileImageUrl
                    ? `url(${profileImageUrl}) center/cover`
                    : 'linear-gradient(to bottom right, #1e3a8a, #1e40af)',
                }}
                title="View Profile"
              >
                {!profileImageUrl && userInitial}
              </motion.div>
            </Link>
          </div>
        </div>
      </div>

      {iosSafariNeedsManualSteps && iosGuideOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="text-lg font-semibold text-gray-900">Install on iPhone/iPad</div>
            <p className="mt-2 text-sm text-gray-600">
              Tap <span className="font-semibold">Share</span> then{' '}
              <span className="font-semibold">Add to Home Screen</span>.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={closeIosGuide}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}