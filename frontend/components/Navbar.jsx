'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  Phone,
  Mail,
  Download,
  LogIn,
  ArrowBigRight,
  Home,
  Info,
  BookOpen,
  Building,
  Images,
  Bell,
  Contact,
  Sparkles,
  Star,
  Shield,
  GraduationCap,
  UserCircle,
  Calendar,
  Globe,
  Target
} from 'lucide-react';
import { SCHOOL_INFO } from '@/lib/data';
import { usePwaInstall } from '@/src/hooks/usePwaInstall';

const Navbar = () => {
  const pathname = usePathname();

  const {
    isInstalled,
    supportsPrompt,
    iosSafariNeedsManualSteps,
    promptInstall,
    iosGuideOpen,
    closeIosGuide,
  } = usePwaInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const navbarRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActivePath = (href) => {
    if (!href) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navLinks = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      description: 'Welcome to our school'
    },
    {
      name: 'About Us',
      href: '/about',
      icon: Info,
      description: 'Our legacy & values',
      dropdown: [
        { name: 'History', href: '/about/history' },
        { name: 'Vision & Mission', href: '/about/vision' },
        { name: 'Management', href: '/about/management' },
        { name: 'Faculty', href: '/about/faculty' }
      ]
    },
    {
      name: 'Academics',
      href: '/academics',
      icon: BookOpen,
      description: 'Learning programs',
      dropdown: [
        { name: 'Curriculum', href: '/academics/curriculum' },
        { name: 'Admissions', href: '/academics/admissions' },
        { name: 'Examination', href: '/academics/examination' },
        { name: 'Results', href: '/academics/results' }
      ]
    },
    {
      name: 'Facilities',
      href: '/facilities',
      icon: Building,
      description: 'Modern infrastructure',
      dropdown: [
        { name: 'Classrooms', href: '/facilities/classrooms' },
        { name: 'Laboratories', href: '/facilities/labs' },
        { name: 'Sports', href: '/facilities/sports' },
        { name: 'Library', href: '/facilities/library' }
      ]
    },
    {
      name: 'Gallery',
      href: '/gallery',
      icon: Images,
      description: 'Campus life'
    },
    {
      name: 'Notices',
      href: '/notices',
      icon: Bell,
      description: 'Latest updates',
      badge: 'New'
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: Contact,
      description: 'Get in touch'
    },
  ];

  const iconMap = {
    Home, Info, BookOpen, Building, Images, Bell, Contact
  };

  const showInstallButton = !isInstalled && supportsPrompt;

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <>
      {/* Top Bar - Enhanced */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-2xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-wrap justify-between items-center py-3">
            {/* Contact Info */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-6"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={`tel:${SCHOOL_INFO.phone}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/10 backdrop-blur-sm border border-blue-400/30 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <Phone size={16} className="text-blue-300" />
                </div>
                <div>
                  <div className="text-xs text-blue-200">Call Us</div>
                  <div className="font-medium text-sm group-hover:text-amber-300 transition-colors">
                    {SCHOOL_INFO.phone}
                  </div>
                </div>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 group"
              >
                { (
                <button
                  type="button"
                  onClick={promptInstall}
                  className="mr-3 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  aria-label="Install App"
                >
                  <Download size={16} />
                  <span>Install App</span>
                </button>
              )}
              </motion.a>
            </motion.div>

            {/* School Info */}
            <motion.div
              variants={itemVariants}
              className="hidden md:flex items-center gap-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 backdrop-blur-sm border border-emerald-400/30 flex items-center justify-center">
                  <Globe size={14} className="text-emerald-300" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">{SCHOOL_INFO.medium}</div>
                  <div className="text-xs text-blue-200">Medium</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500/20 to-violet-600/10 backdrop-blur-sm border border-violet-400/30 flex items-center justify-center">
                  <Target size={14} className="text-violet-300" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">{SCHOOL_INFO.affiliation}</div>
                  <div className="text-xs text-blue-200">Affiliated</div>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4"
            >
              <Link
                href="/calendar"
                className="text-xs text-blue-200 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                <Calendar size={12} />
                <span>Academic Calendar</span>
              </Link>
              <div className="h-4 w-px bg-blue-700" />
              <Link
                href="/careers"
                className="text-xs text-blue-200 hover:text-amber-300 transition-colors"
              >
                Careers
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom Gradient Line */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </motion.div>

      {/* Main Navbar */}
      <motion.nav
        ref={navbarRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-2xl shadow-blue-500/10'
            : 'bg-white/90 backdrop-blur-lg'
        }`}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center py-3">
            {/* Logo Section */}
            <Link
              href="/"
              className="flex items-center gap-4 group relative"
              onMouseEnter={() => setHoveredLink('logo')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {/* Animated Logo Container */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl blur-lg"
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <GraduationCap className="w-8 h-8 text-white" />
                  <motion.div
                    className="absolute inset-0 border-2 border-transparent rounded-2xl"
                    animate={{
                      borderColor: ['rgba(245, 158, 11, 0)', 'rgba(245, 158, 11, 0.5)', 'rgba(245, 158, 11, 0)'],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>

              {/* Logo Text */}
              <div className="hidden md:block">
                <motion.h1
                  className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.02 }}
                >
                  {SCHOOL_INFO.name}
                </motion.h1>
                <motion.p
                  className="text-sm text-gray-600 flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Sparkles size={12} className="text-amber-500" />
                  {SCHOOL_INFO.tagline}
                </motion.p>
              </div>

              {/* Hover Effect */}
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 to-amber-500/10 rounded-2xl opacity-0 group-hover:opacity-100"
                initial={false}
                animate={{ scale: hoveredLink === 'logo' ? 1 : 0.9 }}
                transition={{ duration: 0.3 }}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 relative">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => setHoveredLink(link.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`relative px-5 py-3 flex items-center gap-2 font-medium transition-colors group ${
                        isActivePath(link.href)
                          ? 'text-blue-900 border-b-2 border-blue-600'
                          : 'text-gray-700 hover:text-blue-900 border-b-2 border-transparent'
                      }`}
                    >
                      {/* Icon */}
                      <motion.div
                        className="relative"
                        animate={{
                          rotate: hoveredLink === link.name ? 360 : 0,
                          scale: hoveredLink === link.name ? 1.2 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon size={18} className="text-blue-600 group-hover:text-amber-500 transition-colors" />
                      </motion.div>

                      {/* Text */}
                      <span className="relative">
                        {link.name}
                        {link.badge && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-3 px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full"
                          >
                            {link.badge}
                          </motion.span>
                        )}
                      </span>

                      {/* Background Glow */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-amber-500/5 rounded-xl opacity-0 group-hover:opacity-100"
                        initial={false}
                        animate={{ scale: hoveredLink === link.name ? 1 : 0.9 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Link>

                    {/* Dropdown Menu */}
                    {link.dropdown && hoveredLink === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                      >
                        <div className="p-2">
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-900 hover:bg-gradient-to-r from-blue-50 to-amber-50 rounded-xl transition-all group"
                              onClick={() => setHoveredLink(null)}
                            >
                              <motion.div
                                className="w-2 h-2 bg-gradient-to-r from-blue-500 to-amber-500 rounded-full"
                                whileHover={{ scale: 1.5 }}
                              />
                              <span className="font-medium">{item.name}</span>
                              <ArrowBigRight
                                size={16}
                                className="ml-auto text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform"
                              />
                            </Link>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="bg-gradient-to-r from-blue-50 to-amber-50 p-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600">{link.description}</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

            </div>

            {/* Login Button - Desktop */}
            <motion.div
              className="hidden lg:block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/login"
                // className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 overflow-hidden"
              >
                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 2
                  }}
                />

                <span className="relative z-10 flex items-center gap-3">
                  <UserCircle size={20} />
                  <span>User Login</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowBigRight size={20} />
                  </motion.div>
                </span>
              </Link>
            </motion.div>

            {/* Mobile Login Button */}
            <motion.div
              className="lg:hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* {showInstallButton && (
                <button
                  type="button"
                  onClick={promptInstall}
                  className="mr-2 inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                  aria-label="Install App"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Install App</span>
                </button>
              )} */}
              <Link
                href="/login"
                className="relative px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold flex items-center gap-2"
              >
                <UserCircle size={18} />
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="hidden sm:inline"
                >
                  Login
                </motion.span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <ArrowBigRight size={18} />
                </motion.div>
              </Link>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all relative overflow-hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-amber-500/10"
                animate={{ opacity: isOpen ? 1 : 0 }}
              />
              {isOpen ? (
                <X size={28} className="text-blue-900" />
              ) : (
                <Menu size={28} className="text-blue-900" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-gradient-to-b from-white to-blue-50 border-t border-gray-100 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-6">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  {navLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <motion.div
                        key={link.name}
                        variants={itemVariants}
                        custom={index}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 px-4 py-4 text-gray-700 hover:text-blue-900 font-medium transition-all rounded-2xl hover:bg-gradient-to-r from-blue-50 to-amber-50 group"
                        >
                          <motion.div
                            className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon size={20} className="text-blue-600" />
                          </motion.div>

                          <div className="flex-1">
                            <div className="font-semibold text-lg flex items-center gap-2">
                              {link.name}
                              {link.badge && (
                                <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full">
                                  {link.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{link.description}</div>
                          </div>

                          <ArrowBigRight
                            size={20}
                            className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-transform"
                          />
                        </Link>

                        {/* Mobile Dropdown */}
                        {link.dropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="ml-16 mt-2 space-y-1"
                          >
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-blue-900 transition-colors rounded-lg"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="text-sm">{item.name}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}

                  {/* Mobile CTA */}
                  <motion.div
                    variants={itemVariants}
                    className="pt-6 border-t border-gray-200"
                  >
                    {showInstallButton && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          promptInstall();
                        }}
                        className="mb-4 block w-full px-6 py-4 bg-blue-600 text-white rounded-2xl font-semibold text-center text-lg hover:bg-blue-700 transition-colors"
                      >
                        Install App
                      </button>
                    )}
                    <Link
                      href="/contact"
                      onClick={() => setIsOpen(false)}
                      className="block w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold text-center text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      Schedule a Visit
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll Indicator */}
        {isScrolled && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-amber-500 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </motion.nav>

      {/* Floating Action Button for Mobile */}
      <motion.div
        className="fixed bottom-6 right-6 z-40 lg:hidden"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Link
          href="/contact"
          className="relative w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/30"
        >
          <Phone size={24} className="text-white" />
          <motion.div
            className="absolute inset-0 border-2 border-amber-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </Link>
      </motion.div>

      {iosSafariNeedsManualSteps && iosGuideOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="text-lg font-semibold text-gray-900">Install on iPhone/iPad</div>
            <p className="mt-2 text-sm text-gray-600">
              Tap <span className="font-semibold">Share</span> then{' '}
              <span className="font-semibold">Add to Home Screen</span>.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={closeIosGuide}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
