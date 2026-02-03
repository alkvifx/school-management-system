'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Award } from 'lucide-react';
import { MERITORIOUS_STUDENTS } from '@/lib/data';

/* animations */
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function MeritoriousStudentsPage() {
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  /* unique dropdown values */
  const classes = useMemo(
    () => ['All', ...new Set(MERITORIOUS_STUDENTS.map(s => s.class))],
    []
  );

  const years = useMemo(
    () => ['All', ...new Set(MERITORIOUS_STUDENTS.map(s => s.year))],
    []
  );

  /* filtered students */
  const filteredStudents = MERITORIOUS_STUDENTS.filter(student => {
    const matchClass =
      selectedClass === 'All' || student.class === selectedClass;

    const matchYear =
      selectedYear === 'All' || student.year === selectedYear;

    const matchSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchClass && matchYear && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Heading */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center mb-10"
        >
          <div className="inline-block px-4 py-2 bg-amber-100 text-amber-900 rounded-full text-sm font-semibold mb-4">
            Academic Excellence
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Meritorious Students
          </h1>
          <p className="text-gray-600 text-lg">
            Celebrating outstanding academic achievements
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="bg-white rounded-2xl shadow-lg p-6 mb-10"
        >
          <div className="grid md:grid-cols-3 gap-4">
            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-900 outline-none"
            >
              {classes.map(cls => (
                <option key={cls} value={cls}>
                  {cls === 'All' ? 'All Classes' : `Class ${cls}`}
                </option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-900 outline-none"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year === 'All' ? 'All Years' : year}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search student name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-900 outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <p className="text-center text-gray-600">
            No students found.
          </p>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredStudents.map(student => (
              <motion.div
                key={student.id}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center">
                    <Award size={26} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Class {student.class} • {student.year}
                    </p>
                  </div>
                </div>

                <div className="text-gray-700 space-y-2">
                  <p>
                    <span className="font-semibold">Percentage:</span>{' '}
                    {student.percentage}%
                  </p>
                  <p>
                    <span className="font-semibold">Achievement:</span>{' '}
                    {student.achievement}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
