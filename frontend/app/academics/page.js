'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Microscope,
  Calculator,
  Globe,
  Computer,
  Palette,
  Music,
  Dumbbell,
  Sparkles,
  Target,
  Brain,
  Zap,
  Users,
  Award,
  Clock,
  Star,
  TrendingUp,
  GraduationCap,
  Lightbulb,
  Shield,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Download,
  BarChart,
  BookMarked,
  Layers,
  Cpu,
  Atom,
  Languages,
  Music2,
  Brush,
  HeartPulse
} from 'lucide-react';
import { ACADEMICS_DATA } from '@/lib/data';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: "backOut"
    }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const floatingAnimation = {
  y: [0, -20, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredSubject, setHoveredSubject] = useState(null);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const subjects = [
    { icon: Calculator, name: 'Mathematics', color: 'from-blue-500 to-blue-600', description: 'Logical thinking & problem solving' },
    { icon: Microscope, name: 'Science', color: 'from-emerald-500 to-emerald-600', description: 'Physics, Chemistry & Biology' },
    { icon: Globe, name: 'Social Studies', color: 'from-amber-500 to-amber-600', description: 'History, Geography & Civics' },
    { icon: Languages, name: 'Languages', color: 'from-violet-500 to-violet-600', description: 'English, Hindi & Sanskrit' },
    { icon: Cpu, name: 'Computer Science', color: 'from-indigo-500 to-indigo-600', description: 'Coding & Digital Literacy' },
    { icon: Brush, name: 'Art & Craft', color: 'from-pink-500 to-pink-600', description: 'Creative expression' },
    { icon: Music2, name: 'Music', color: 'from-rose-500 to-rose-600', description: 'Vocal & Instrumental' },
    { icon: HeartPulse, name: 'Physical Education', color: 'from-teal-500 to-teal-600', description: 'Sports & Wellness' },
  ];

  const methodologies = [
    {
      icon: Brain,
      title: 'Interactive Learning',
      description: 'Engaging activities and discussions for better understanding',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Zap,
      title: 'Technology Integration',
      description: 'Smart boards and digital resources for modern education',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: Layers,
      title: 'Project-Based Learning',
      description: 'Hands-on projects to develop practical skills',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Users,
      title: 'Individual Attention',
      description: 'Personalized support to address each student\'s needs',
      color: 'from-violet-500 to-violet-600'
    },
    {
      icon: BarChart,
      title: 'Continuous Assessment',
      description: 'Regular evaluation to track progress and improvement',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Target,
      title: 'Holistic Development',
      description: 'Balanced focus on academics and extracurriculars',
      color: 'from-rose-500 to-rose-600'
    },
  ];

  const examStats = [
    { value: '40%', label: 'Continuous Assessment', icon: Clock, color: 'from-blue-500 to-blue-600' },
    { value: '60%', label: 'Term Examinations', icon: BookMarked, color: 'from-emerald-500 to-emerald-600' },
    { value: '100%', label: 'Holistic Evaluation', icon: Award, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div ref={containerRef} className="overflow-hidden">
      {/* Hero Header */}
      <section className="relative min-h-[500px] overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent" />
          <motion.div
            style={{ y }}
            className="absolute inset-0 opacity-20"
          >
            <div className="absolute inset-0 bg-[url('/images/science-pattern.svg')] bg-repeat opacity-30" />
          </motion.div>
          <motion.div
            className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-full blur-3xl"
            animate={floatingAnimation}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 min-h-[500px] flex items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl text-center mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white/90">Excellence in Education</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text text-transparent"
            >
              Academics
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed"
            >
              Comprehensive curriculum designed for holistic development and future success
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex justify-center items-center gap-4"
            >
              <div className="flex items-center gap-2 text-white/80">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span className="text-sm">CBSE Affiliated</span>
              </div>
              <div className="w-2 h-2 bg-white/30 rounded-full" />
              <div className="flex items-center gap-2 text-white/80">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span className="text-sm">Modern Curriculum</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-sm font-medium">Explore Academics</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Curriculum Overview */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white to-blue-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full text-sm font-semibold mb-6 border border-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Our Curriculum
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-gray-900">
              Classes & <span className="text-blue-600">Programs</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Structured learning pathways aligned with CBSE guidelines for optimal development
            </p>
          </motion.div>

          {/* Class Tabs - Enhanced */}
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
              {ACADEMICS_DATA.classes.map((cls, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveTab(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    activeTab === index
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/30'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <span className="relative z-10">{cls.name}</span>
                  {activeTab === index && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  {/* Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-amber-50 to-white" />

                  {/* Animated Border */}
                  <motion.div
                    className="absolute inset-0 border-2 border-transparent rounded-3xl"
                    animate={{
                      borderColor: ['rgba(59, 130, 246, 0.1)', 'rgba(245, 158, 11, 0.3)', 'rgba(59, 130, 246, 0.1)'],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  <div className="relative z-10 p-8 md:p-12">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <motion.div
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <GraduationCap className="w-8 h-8 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-3xl font-bold text-gray-900">
                              {ACADEMICS_DATA.classes[activeTab].name}
                            </h3>
                            <p className="text-blue-600 font-medium">Age: {ACADEMICS_DATA.classes[activeTab].age}</p>
                          </div>
                        </div>

                        <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                          {ACADEMICS_DATA.classes[activeTab].description}
                        </p>

                        <div className="flex items-center gap-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Syllabus
                          </motion.button>
                          <button className="flex items-center gap-2 text-blue-600 font-medium">
                            Learn more <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                          <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Subjects Offered
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {ACADEMICS_DATA.classes[activeTab].subjects.map((subject, index) => (
                              <motion.span
                                key={index}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full text-gray-700 font-medium border border-blue-200"
                              >
                                {subject}
                              </motion.span>
                            ))}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="text-sm text-gray-500">Daily Classes</div>
                            <div className="text-lg font-bold text-gray-900">6-7 Hours</div>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="text-sm text-gray-500">Student-Teacher Ratio</div>
                            <div className="text-lg font-bold text-gray-900">30:1</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/images/science-grid.svg')]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-100 to-amber-50 rounded-full text-sm font-semibold mb-6 border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Comprehensive Learning
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-gray-900">
              Subject <span className="text-amber-600">Areas</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Diverse disciplines for a well-rounded education and skill development
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {subjects.map((subject, index) => {
              const Icon = subject.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInScale}
                  className="group relative"
                  onMouseEnter={() => setHoveredSubject(index)}
                  onMouseLeave={() => setHoveredSubject(null)}
                >
                  <div className="relative p-8 rounded-3xl bg-white border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    {/* Animated Background */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                      animate={{
                        background: hoveredSubject === index ? [
                          `linear-gradient(135deg, var(--tw-gradient-stops) 0%, transparent 100%)`,
                          `linear-gradient(135deg, transparent 0%, var(--tw-gradient-stops) 100%)`,
                          `linear-gradient(135deg, var(--tw-gradient-stops) 0%, transparent 100%)`,
                        ] : 'none'
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />

                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />

                    <div className="relative z-10">
                      <motion.div
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="w-10 h-10 text-white" />
                      </motion.div>

                      <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                        {subject.name}
                      </h3>

                      <p className="text-gray-600 text-center text-sm">
                        {subject.description}
                      </p>

                      {/* Hover Indicator */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Subject Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-blue-50 to-amber-50 rounded-2xl border border-blue-100 shadow-lg">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <span className="text-gray-700 font-medium">
                All subjects include practical learning and real-world applications
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Teaching Methodology */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full text-sm font-semibold mb-6 border border-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Modern Education
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-gray-900">
              Teaching <span className="text-blue-600">Methodology</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Innovative approaches to ensure effective learning and skill development
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {methodologies.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInScale}
                  className="group relative"
                >
                  <div className="relative p-8 rounded-3xl bg-white border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden h-full">
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                    {/* Number Badge */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {index + 1}
                    </div>

                    <div className="relative z-10">
                      <motion.div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                        whileHover={{ rotate: 5 }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {method.title}
                      </h3>

                      <p className="text-gray-600 leading-relaxed">
                        {method.description}
                      </p>

                      {/* Learn More Link */}
                      <motion.div
                        className="flex items-center gap-2 mt-6 text-blue-600 font-medium"
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-sm">Learn more</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Examination System */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/20 to-transparent" />
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-transparent rounded-full blur-3xl"
            animate={floatingAnimation}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-6xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-amber-600/10 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-amber-500/20">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Evaluation System
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text text-transparent">
              Examination & <span className="text-amber-400">Evaluation</span>
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-blue-200 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              We follow a comprehensive evaluation system based on CBSE guidelines, focusing on
              conceptual understanding rather than rote learning. Our approach ensures students
              develop critical thinking and problem-solving skills.
            </motion.p>

            {/* Stats Cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8 mb-12"
            >
              {examStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeInScale}
                    className="group relative"
                  >
                    <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
                      {/* Animated Background */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />

                      <div className="relative z-10">
                        <motion.div
                          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="w-10 h-10 text-white" />
                        </motion.div>

                        <motion.div
                          className="text-5xl font-bold bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent mb-2"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                        >
                          {stat.value}
                        </motion.div>

                        <div className="text-lg font-semibold text-white">
                          {stat.label}
                        </div>

                        <p className="text-blue-200 text-sm mt-2">
                          Comprehensive evaluation for optimal learning
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Evaluation Process */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-sm rounded-3xl p-8 border border-blue-700/30"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Evaluation Process</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { step: '1', title: 'Continuous Assessment', desc: 'Regular tests & assignments' },
                  { step: '2', title: 'Term Examinations', desc: 'Comprehensive semester exams' },
                  { step: '3', title: 'Practical Evaluation', desc: 'Hands-on skill assessment' },
                ].map((process, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-blue-900/20"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{process.step}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{process.title}</div>
                      <div className="text-blue-300 text-sm">{process.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-blue-50">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-100 to-amber-50 rounded-full text-sm font-semibold mb-6 border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Start Your Journey
            </div>

            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-gray-900">
              Ready to Excel <br />
              in <span className="text-blue-600">Academics</span>?
            </h2>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join our comprehensive academic program and unlock your potential with
              expert guidance and modern learning methodologies.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-3"
              >
                <Download className="w-5 h-5" />
                Download Syllabus
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-full font-bold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center gap-3"
              >
                <BookOpen className="w-5 h-5" />
                View Curriculum
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 pt-8 border-t border-gray-200"
            >
              <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>CBSE Aligned Curriculum</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>Experienced Faculty</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>Modern Teaching Methods</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + Math.sin(i) * 30}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}
      </section>
    </div>
  );
}