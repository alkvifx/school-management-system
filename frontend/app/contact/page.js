'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, User, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { SCHOOL_INFO } from '@/lib/data';
import { contactService } from '@/src/services/contact.service';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      await contactService.sendMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message || 'Failed to send your message. Please try again.');
    } finally {
      setSubmitting(false);
      // Hide success after a few seconds (non-blocking)
      if (!error) {
        setTimeout(() => setSubmitted(false), 4000);
      }
    }
  };

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
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-blue-200">We'd love to hear from you</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 },
              },
            }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <motion.div
              variants={fadeIn}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin size={28} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Address</h3>
              <p className="text-gray-600 text-sm">{SCHOOL_INFO.address}</p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Phone size={28} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Phone</h3>
              <a href={`tel:${SCHOOL_INFO.phone}`} className="text-gray-600 text-sm hover:text-blue-900">
                {SCHOOL_INFO.phone}
              </a>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mail size={28} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Email</h3>
              <a href={`mailto:${SCHOOL_INFO.email}`} className="text-gray-600 text-sm hover:text-blue-900">
                {SCHOOL_INFO.email}
              </a>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Clock size={28} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Office Hours</h3>
              <p className="text-gray-600 text-sm">Mon - Sat</p>
              <p className="text-gray-600 text-sm">8:00 AM - 2:00 PM</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="mb-8">
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold mb-4">
                  Get in Touch
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
                <p className="text-gray-600 text-lg">
                  Have questions about admissions, curriculum, or facilities? We're here to help!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-900 focus:outline-none transition"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-900 focus:outline-none transition"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-900 focus:outline-none transition"
                      placeholder="+91 1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-900 focus:outline-none transition"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Message *</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-gray-400" size={20} />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-900 focus:outline-none transition resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm flex items-center gap-2">
                    <span>{error}</span>
                  </div>
                )}

                {submitted && !error && (
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>Your message has been sent to the school. We will get back to you soon.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send size={20} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Map */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: 0.2 }}
              className="h-full min-h-[600px]"
            >
              <div className="bg-gradient-to-br from-blue-50 to-amber-50 rounded-3xl overflow-hidden shadow-xl h-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.1076438469384!2d77.3649857!3d28.6303914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5456ef36d9f%3A0x3b7191b1286136c8!2sDelhi%20Public%20School%2C%20Noida!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Admissions CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Enroll?</h2>
            <p className="text-xl text-blue-200 mb-8">
              Admissions for the academic year 2025-26 are now open. Schedule a campus visit or
              apply online today!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all">
                Apply Now
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-blue-900 transition-all">
                Schedule Visit
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}