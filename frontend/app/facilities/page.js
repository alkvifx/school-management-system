'use client';

import { motion } from 'framer-motion';
import {
  Monitor,
  FlaskConical,
  Library,
  Dumbbell,
  Computer,
  Bus,
  Utensils,
  Heart,
  Shield,
  Wifi,
} from 'lucide-react';
import { FACILITIES } from '@/lib/data';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const iconMap = {
  Monitor,
  FlaskConical,
  Library,
  Dumbbell,
  Computer,
  Bus,
};

export default function FacilitiesPage() {
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
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Facilities</h1>
            <p className="text-xl text-blue-200">World-class infrastructure for holistic learning</p>
          </motion.div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold mb-4">
              Our Infrastructure
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">State-of-the-Art Facilities</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Modern amenities designed to enhance the learning experience
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {FACILITIES.map((facility, index) => {
              const Icon = iconMap[facility.icon];
              return (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={facility.image}
                      alt={facility.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3">
                        <Icon size={28} className="text-blue-900" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{facility.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{facility.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Additional Amenities */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Additional Amenities</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive facilities ensuring student comfort and safety
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Utensils,
                title: 'Hygienic Canteen',
                description: 'Nutritious and healthy meals',
              },
              {
                icon: Heart,
                title: 'Medical Room',
                description: 'First aid and health monitoring',
              },
              {
                icon: Shield,
                title: '24/7 Security',
                description: 'CCTV surveillance and guards',
              },
              {
                icon: Wifi,
                title: 'Wi-Fi Campus',
                description: 'High-speed internet access',
              },
            ].map((amenity, index) => {
              const Icon = amenity.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-amber-50 p-6 rounded-2xl text-center hover:shadow-lg transition-all group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{amenity.title}</h3>
                  <p className="text-gray-600 text-sm">{amenity.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sports Facilities */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-amber-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Sports & Recreation</h2>
              <p className="text-gray-600 text-lg">
                Comprehensive sports facilities promoting physical fitness and teamwork
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Basketball', emoji: '🏀' },
                { name: 'Volleyball', emoji: '🏐' },
                { name: 'Cricket', emoji: '🏏' },
                { name: 'Football', emoji: '⚽' },
                { name: 'Badminton', emoji: '🏸' },
                { name: 'Table Tennis', emoji: '🏓' },
                { name: 'Chess', emoji: '♟️' },
                { name: 'Athletics', emoji: '🏃' },
                { name: 'Yoga', emoji: '🧘' },
              ].map((sport, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all text-center group hover:-translate-y-1"
                >
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform">
                    {sport.emoji}
                  </div>
                  <h3 className="font-semibold text-gray-900">{sport.name}</h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}