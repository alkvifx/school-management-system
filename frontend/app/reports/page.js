'use client';

import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';

export default function ReportsPage() {
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
              <FileText className="h-10 w-10" />
              Annual Reports
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Downloadable annual reports and important policy documents will appear here.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col items-center text-center">
            <p className="text-gray-700 text-sm md:text-base mb-4">
              The latest report is not yet uploaded. This section is ready to host PDF links or
              downloads managed through the admin panel in future.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-200 text-gray-600 text-sm font-semibold cursor-not-allowed">
              <Download className="h-4 w-4" />
              Download Report (coming soon)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

