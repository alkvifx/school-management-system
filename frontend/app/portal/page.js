'use client';

import { motion } from 'framer-motion';
import { Shield, LogIn } from 'lucide-react';

export default function ParentPortalPage() {
  return (
    <div>
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <Shield className="h-10 w-10" />
              Parent Portal
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Secure access for parents to view their ward&apos;s attendance, progress and
              communication.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col items-center text-center space-y-4">
            <p className="text-gray-700 text-sm md:text-base">
              The dedicated parent portal will be linked here. For now, registered parents can
              continue using the main login page to access student dashboards.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-900 to-blue-700 text-white text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all">
              <LogIn className="h-4 w-4" />
              Go to Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

