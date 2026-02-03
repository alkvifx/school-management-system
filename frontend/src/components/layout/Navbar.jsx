'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/auth.context';
import { NotificationDropdown } from '../NotificationDropdown';
import { ROLES } from '../../utils/constants';
import { motion } from 'framer-motion';

export default function AuthNavbar({ onMenuClick }) {
  const { user } = useAuth();
  const showNotifications = user?.role === ROLES.TEACHER || user?.role === ROLES.STUDENT;

  const profileImageUrl = user?.profileImage?.url || null;
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Welcome back, {user?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {showNotifications && <NotificationDropdown />}
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
    </nav>
  );
}
