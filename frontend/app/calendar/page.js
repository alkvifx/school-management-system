'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';

export default function AcademicCalendarPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <Calendar className="h-10 w-10" />
              Academic Calendar
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Important academic dates including term schedules, examinations, holidays, and
              school events.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Placeholder Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Term Outline</h2>
                <p className="text-sm text-gray-500">
                  This calendar is configurable from the admin panel in future.
                </p>
              </div>
            </div>
            <p className="text-gray-700 text-sm md:text-base mb-6">
              Your school&apos;s detailed academic calendar (term dates, examination windows,
              holidays, PTMs, and major events) will be displayed here. For now, please refer to
              the notices or contact the school office for the latest schedule.
            </p>
            <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-800">
                <ChevronRight className="h-4 w-4" />
                Term dates
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800">
                <ChevronRight className="h-4 w-4" />
                Examination schedule
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800">
                <ChevronRight className="h-4 w-4" />
                Holidays & PTMs
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

