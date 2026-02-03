'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Star,
  Award,
  GraduationCap,
  Heart,
  ExternalLink,
  Send,
  Globe,
  Shield,
  Trophy,
  Users,
  BookOpen,
  Calendar,
  Download
} from 'lucide-react';
import { SCHOOL_INFO } from '@/lib/data';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', href: '/', icon: ArrowRight },
    { name: 'About Us', href: '/about', icon: Users },
    { name: 'Academics', href: '/academics', icon: BookOpen },
    { name: 'Facilities', href: '/facilities', icon: Trophy },
  ];

  const importantLinks = [
    { name: 'Gallery', href: '/gallery', icon: Sparkles },
    { name: 'Notices', href: '/notices', icon: Calendar },
    { name: 'Contact Us', href: '/contact', icon: Send },
    { name: 'Admissions', href: '/contact', icon: GraduationCap },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'from-blue-600 to-blue-800' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'from-sky-500 to-sky-700' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'from-pink-500 to-rose-700' },
    { name: 'YouTube', icon: Youtube, href: '#', color: 'from-red-500 to-red-700' },
  ];

  const resources = [
    { name: 'Annual Report 2024', href: '/reports', icon: Download },
    { name: 'School Calendar', href: '/calendar', icon: Calendar },
    { name: 'Parent Portal', href: '/portal', icon: Shield },
    { name: 'Careers', href: '/careers', icon: Users },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-blue-950 to-gray-950">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-900/10 to-amber-600/5 rounded-full blur-3xl"
          animate={floatingAnimation}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-amber-600/5 to-blue-900/10 rounded-full blur-3xl"
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 1 }
          }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')]" />
        </div>

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Newsletter Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 container mx-auto px-4 -mt-24 mb-16"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/images/pattern.svg')]" />
          </div>

          <div className="relative z-10 p-8 mt-32 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/10 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm border border-amber-500/20">
                  <Sparkles size={14} className="text-amber-400" />
                  Stay Updated
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  Subscribe to Our Newsletter
                </h3>
                <p className="text-blue-200">
                  Get the latest news, announcements, and updates delivered to your inbox.
                </p>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-2xl placeholder-blue-300 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                  >
                    <span>Subscribe</span>
                    <Send size={18} />
                  </motion.button>
                </div>
                <p className="text-blue-300 text-sm mt-3">
                  By subscribing, you agree to our Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Footer Content */}
      <div className="relative z-10 container mx-auto px-4 pb-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Left Column - Brand & Contact */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Brand Section */}
            <div>
              <Link href="/" className="inline-block group">
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-blue-600 to-amber-500 rounded-3xl blur-lg"
                      animate={{ opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
                      <GraduationCap className="w-10 h-10 text-white" />
                      <motion.div
                        className="absolute inset-0 border-2 border-transparent rounded-3xl"
                        animate={{
                          borderColor: ['rgba(245, 158, 11, 0)', 'rgba(245, 158, 11, 0.5)', 'rgba(245, 158, 11, 0)'],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>

                  <div>
                    <motion.h3
                      className="text-3xl font-bold bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text text-transparent"
                      whileHover={{ scale: 1.02 }}
                    >
                      {SCHOOL_INFO.name}
                    </motion.h3>
                    <motion.p
                      className="text-blue-300 flex items-center gap-2 mt-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Sparkles size={12} className="text-amber-400" />
                      {SCHOOL_INFO.tagline}
                    </motion.p>
                  </div>
                </div>
              </Link>

              <motion.p
                className="text-blue-200 leading-relaxed text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Committed to providing quality education and nurturing young minds since {SCHOOL_INFO.established}.
                Empowering future leaders with knowledge, values, and skills for a better tomorrow.
              </motion.p>

              {/* Achievements */}
              <motion.div
                className="flex flex-wrap gap-4 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-900/30 to-blue-800/20 backdrop-blur-sm rounded-full border border-blue-700/30">
                  <Award size={14} className="text-amber-400" />
                  <span className="text-sm text-blue-200">ISO Certified</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-900/30 to-blue-800/20 backdrop-blur-sm rounded-full border border-blue-700/30">
                  <Shield size={14} className="text-emerald-400" />
                  <span className="text-sm text-blue-200">Safe Campus</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-900/30 to-blue-800/20 backdrop-blur-sm rounded-full border border-blue-700/30">
                  <Globe size={14} className="text-sky-400" />
                  <span className="text-sm text-blue-200">Global Standards</span>
                </div>
              </motion.div>
            </div>

            {/* Contact Info */}
            <motion.div
              variants={itemVariants}
              className="space-y-4"
            >
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-700/30 hover:border-blue-600/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Our Location</h4>
                  <p className="text-blue-200 text-sm">{SCHOOL_INFO.address}</p>
                  <motion.a
                    href="#"
                    className="inline-flex items-center gap-1 text-amber-400 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ x: 5 }}
                  >
                    View on map <ExternalLink size={12} />
                  </motion.a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-700/30 hover:border-blue-600/50 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">Call Us</h4>
                  <a href={`tel:${SCHOOL_INFO.phone}`} className="text-blue-200 text-sm hover:text-amber-400 transition-colors">
                    {SCHOOL_INFO.phone}
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/20 to-blue-800/10 backdrop-blur-sm border border-blue-700/30 hover:border-blue-600/50 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">Email Us</h4>
                  <a href={`mailto:${SCHOOL_INFO.email}`} className="text-blue-200 text-sm hover:text-amber-400 transition-colors">
                    {SCHOOL_INFO.email}
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Links & Social */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Links Grid */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-amber-500 to-amber-600 w-1 h-6 rounded-full"></span>
                  Quick Links
                </h3>
                <ul className="space-y-3">
                  {quickLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 text-blue-200 hover:text-white p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-blue-800/20 transition-all group"
                        >
                          <motion.div
                            className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700/20 to-blue-600/10 flex items-center justify-center group-hover:scale-110 transition-transform"
                            whileHover={{ rotate: 5 }}
                          >
                            <Icon size={18} className="text-blue-400" />
                          </motion.div>
                          <span className="font-medium">{link.name}</span>
                          <ChevronRight size={16} className="ml-auto text-blue-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-amber-500 to-amber-600 w-1 h-6 rounded-full"></span>
                  Resources
                </h3>
                <ul className="space-y-3">
                  {resources.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 text-blue-200 hover:text-white p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-blue-800/20 transition-all group"
                        >
                          <motion.div
                            className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-700/20 to-amber-600/10 flex items-center justify-center group-hover:scale-110 transition-transform"
                            whileHover={{ rotate: 5 }}
                          >
                            <Icon size={18} className="text-amber-400" />
                          </motion.div>
                          <span className="font-medium">{link.name}</span>
                          <Download size={16} className="ml-auto text-amber-600 group-hover:text-amber-400 group-hover:scale-110 transition-transform" />
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 w-1 h-6 rounded-full"></span>
                Follow Us
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative group w-14 h-14 rounded-2xl bg-gradient-to-br ${social.color} flex items-center justify-center shadow-lg hover:shadow-xl transition-all`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                      <motion.div
                        className="absolute inset-0 border-2 border-transparent rounded-2xl"
                        animate={{
                          borderColor: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0)'],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {social.name}
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Working Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 to-blue-800/20 backdrop-blur-sm border border-blue-700/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Working Hours</h4>
                  <p className="text-blue-200 text-sm">Visit us anytime</p>
                </div>
              </div>
              <div className="space-y-2 text-blue-200">
                <div className="flex justify-between items-center py-2 border-b border-blue-800/30">
                  <span>Monday - Friday</span>
                  <span className="font-semibold text-white">8:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-800/30">
                  <span>Saturday</span>
                  <span className="font-semibold text-white">8:00 AM - 12:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Sunday</span>
                  <span className="font-semibold text-amber-400">Closed</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-blue-800/50">
        {/* Animated Gradient Line */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"
          animate={{
            scaleX: [0, 1, 0],
            x: ['-100%', '100%', '-100%']
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.p
              className="text-blue-300 text-sm text-center md:text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              &copy; {new Date().getFullYear()} {SCHOOL_INFO.name}. All rights reserved.
              <span className="hidden md:inline"> | </span>
              <span className="block md:inline mt-1 md:mt-0">
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
                {' • '}
                <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
                {' • '}
                <Link href="/sitemap" className="hover:text-amber-400 transition-colors">Sitemap</Link>
              </span>
            </motion.p>

            <motion.div
              className="flex items-center gap-2 text-amber-400"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-sm">
                Designed with passion by <span className="font-semibold">Muhammad Faizan</span> & <span className="font-semibold">Alkaif Khan</span>
              </span>
              <motion.div
                className="ml-2 flex items-center gap-1"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="w-3 h-3 text-amber-400 fill-current" />
                <Star className="w-3 h-3 text-amber-400 fill-current" />
                <Star className="w-3 h-3 text-amber-400 fill-current" />
              </motion.div>
            </motion.div>
          </div>

          {/* Back to Top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center mt-6"
          >
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-900/30 to-blue-800/20 backdrop-blur-sm border border-blue-700/30 text-blue-300 rounded-full hover:text-amber-400 hover:border-amber-500/50 transition-all"
            >
              <span>Back to Top</span>
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4 rotate-90" />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute bottom-20 left-4 w-6 h-6 bg-gradient-to-r from-blue-500/20 to-amber-500/20 rounded-full blur-sm"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/3 right-8 w-4 h-4 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-full blur-sm"
        animate={{
          y: [0, 40, 0],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </footer>
  );
};

export default Footer;