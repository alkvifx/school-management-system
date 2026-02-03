'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, Search, Pin } from 'lucide-react';
import { ANNOUNCEMENTS } from '@/lib/data';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function NoticesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAnnouncements = ANNOUNCEMENTS.filter((announcement) =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const importantNotices = filteredAnnouncements.filter(a => a.important);
  const regularNotices = filteredAnnouncements.filter(a => !a.important);

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Notices & Announcements</h1>
            <p className="text-xl text-blue-200">Stay updated with the latest school news</p>
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-300 focus:border-blue-900 focus:outline-none text-gray-900 font-medium transition"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Important Notices */}
      {importantNotices.length > 0 && (
        <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <AlertCircle size={24} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Important Notices</h2>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 gap-6"
            >
              {importantNotices.map((notice, index) => (
                <motion.div
                  key={notice.id}
                  variants={fadeIn}
                  className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-200 hover:shadow-xl transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg">
                        <div className="text-xs font-semibold">
                          {new Date(notice.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-3xl font-bold">{new Date(notice.date).getDate()}</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Pin size={18} className="text-red-500" />
                        <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs rounded-full font-semibold">
                          Important
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-xl group-hover:text-red-600 transition">
                        {notice.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{notice.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Regular Notices */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">All Notices</h2>
            </div>
          </motion.div>

          {regularNotices.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-4 max-w-5xl mx-auto"
            >
              {regularNotices.map((notice, index) => (
                <motion.div
                  key={notice.id}
                  variants={fadeIn}
                  className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg">
                        <div className="text-xs font-semibold">
                          {new Date(notice.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-3xl font-bold">{new Date(notice.date).getDate()}</div>
                        <div className="text-xs">
                          {new Date(notice.date).getFullYear()}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-xl group-hover:text-blue-900 transition">
                        {notice.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{notice.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl">No notices found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-4">Stay Informed</h2>
            <p className="text-xl text-blue-200 mb-8">
              Never miss an important update. Contact our office to subscribe to notice notifications.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+911234567890"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all"
              >
                Call Office
              </a>
              <a
                href="mailto:info@greenwoodschool.edu"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-blue-900 transition-all"
              >
                Email Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}