'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { BookOpen, ChevronRight } from 'lucide-react';

export default function StudentAssignmentsPage() {
  return (
    <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="p-4 sm:p-6 min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Homework & Assignments
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            View your pending assignments and deadlines
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[hsl(var(--app-border))] bg-[hsl(var(--app-surface))] p-8 sm:p-12 text-center shadow-sm"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[hsl(var(--app-accent-muted))] flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-[hsl(var(--app-accent))]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No assignments right now</h2>
          <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
            Your teachers will assign homework here. Check notices and chat for updates.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/notices"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-[hsl(var(--app-accent))] hover:opacity-90 transition-opacity"
            >
              View Notices
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/student/chat"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[hsl(var(--app-border))] hover:bg-[hsl(var(--app-bg))] transition-colors"
            >
              Chat with Teacher
            </Link>
          </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
