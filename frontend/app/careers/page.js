'use client';

import { motion } from 'framer-motion';
import { Briefcase, Users, MapPin, Send } from 'lucide-react';

export default function CareersPage() {
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
              <Briefcase className="h-10 w-10" />
              Careers
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Join our team of passionate educators and help shape the future of our students.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Placeholder Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Work with Us</h2>
                <p className="text-sm text-gray-500">
                  This section will be editable from the Principal&apos;s website admin in future.
                </p>
              </div>
            </div>
            <p className="text-gray-700 text-sm md:text-base">
              Detailed information about open positions, eligibility, and the application process
              will appear here. For now, interested candidates can send their resume to the school
              email address mentioned in the footer, mentioning the position they are applying for.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">How to Apply</h2>
              </div>
            </div>
            <ul className="list-disc list-inside text-gray-700 text-sm md:text-base space-y-2">
              <li>Prepare your detailed CV with recent photograph.</li>
              <li>Mention the position and subject clearly in the email subject.</li>
              <li>Send your application to the official school email address.</li>
              <li>Shortlisted candidates will be contacted for further rounds.</li>
            </ul>
            <button className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-900 to-blue-700 text-white text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all">
              <Send className="h-4 w-4" />
              Send Your Resume
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

