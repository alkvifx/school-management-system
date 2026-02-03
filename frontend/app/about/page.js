'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Clock,
  Target,
  Heart,
  Users,
  Award,
  TrendingUp,
  Sparkles,
  Star,
  Globe,
  Shield,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Users2,
  Building,
  Calendar,
  Trophy,
  Medal,
  Ribbon,
  CheckCircle,
  ArrowRight,
  Zap,
  Brain,
  Target as TargetIcon,
  Leaf,
  Infinity as InfinityIcon,
  LucideIcon
} from 'lucide-react';
import { SCHOOL_INFO, MANAGEMENT } from '@/lib/data';
import { useRef } from 'react';

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

export default function AboutPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const timeline = [
    {
      year: '1985',
      event: 'School established with 50 students',
      icon: Building,
      color: 'from-blue-500 to-blue-600'
    },
    {
      year: '1990',
      event: 'Expanded to middle school section',
      icon: Users2,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      year: '2000',
      event: 'Introduced computer education',
      icon: Globe,
      color: 'from-violet-500 to-violet-600'
    },
    {
      year: '2010',
      event: 'Smart classrooms implemented',
      icon: Zap,
      color: 'from-amber-500 to-amber-600'
    },
    {
      year: '2020',
      event: 'Digital learning platform launched',
      icon: Lightbulb,
      color: 'from-rose-500 to-rose-600'
    },
    {
      year: '2025',
      event: 'Celebrating 40 years of excellence',
      icon: Trophy,
      color: 'from-indigo-500 to-indigo-600'
    },
  ];

  const coreValues = [
    {
      icon: Award,
      title: 'Excellence',
      description: 'Striving for the highest standards in all endeavors',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Shield,
      title: 'Integrity',
      description: 'Upholding honesty, ethics, and moral principles',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Users,
      title: 'Respect',
      description: 'Valuing diversity and treating everyone with dignity',
      color: 'from-violet-500 to-violet-600'
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'Embracing creativity and progressive thinking',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: TargetIcon,
      title: 'Responsibility',
      description: 'Being accountable for our actions and commitments',
      color: 'from-rose-500 to-rose-600'
    },
    {
      icon: Heart,
      title: 'Compassion',
      description: 'Showing empathy and kindness to all',
      color: 'from-pink-500 to-pink-600'
    },
  ];

  return (
    <div ref={containerRef} className="overflow-hidden">
      {/* Hero Header */}
      <section className="relative min-h-[500px] overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent" />
          <motion.div
            className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-full blur-3xl"
            animate={floatingAnimation}
          />
          <motion.div
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-600/10 to-blue-800/5 rounded-full blur-3xl"
            animate={{
              ...floatingAnimation,
              transition: { ...floatingAnimation.transition, delay: 1 }
            }}
          />

          {/* Floating Elements */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-amber-400/30 rounded-full"
              style={{
                left: `${10 + i * 10}%`,
                top: `${20 + Math.sin(i) * 40}%`,
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
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white/90">Our Legacy Since 1985</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text text-transparent"
            >
              About Our School
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed"
            >
              Discover our journey of excellence in education and our commitment to shaping future leaders
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center gap-2 text-white/80"
              >
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span className="text-sm">40+ Years of Educational Excellence</span>
                <Star className="w-4 h-4 text-amber-400 fill-current" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-sm font-medium">Scroll</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Introduction */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full text-sm font-semibold mb-6 border border-blue-200">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Welcome to {SCHOOL_INFO.name}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-gray-900">
                Where Education Meets <span className="text-blue-600">Excellence</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Since our establishment in {SCHOOL_INFO.established}, we have been committed to providing
                world-class education that combines academic excellence with character building.
                Our holistic approach ensures every student discovers their potential.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            >
              {[
                { value: '40+', label: 'Years of Excellence', icon: Calendar },
                { value: '2500+', label: 'Successful Alumni', icon: GraduationCap },
                { value: '150+', label: 'Expert Faculty', icon: Users },
                { value: '95%', label: 'Academic Excellence', icon: Trophy }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeInScale}
                    className="group text-center"
                  >
                    <div className="relative p-6 rounded-3xl bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-all">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="relative z-10">
                        <motion.div
                          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>
                        <motion.div
                          className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent mb-2"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        >
                          {stat.value}
                        </motion.div>
                        <div className="text-gray-600 font-medium">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Management Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')]" />
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
              Leadership Team
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-gray-900">
              Meet Our <span className="text-amber-600">Management</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experienced leaders dedicated to educational excellence and student success
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {MANAGEMENT.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeInScale}
                className="group"
              >
                <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Profile Image Container */}
                  <div className="relative h-72 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/50 via-transparent to-transparent" />
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Animated Background Pattern */}
                      <motion.div
                        className="absolute inset-0 opacity-10"
                        animate={{
                          background: [
                            'radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.2) 0%, transparent 50%)',
                            'radial-gradient(circle at 70% 70%, rgba(245, 158, 11, 0.2) 0%, transparent 50%)',
                            'radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.2) 0%, transparent 50%)',
                          ]
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                      />

                      {/* Initials Avatar */}
                      <motion.div
                        className="relative w-40 h-40 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500"
                        whileHover={{ rotate: 5 }}
                      >
                        <span className="text-5xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>

                        {/* Animated Ring */}
                        <motion.div
                          className="absolute -inset-4 border-2 border-amber-500/30 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="relative p-8 text-center">
                    <motion.div
                      className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Award className="w-6 h-6 text-white" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-2">{member.name}</h3>
                    <p className="text-amber-600 font-semibold mb-4">{member.position}</p>
                    <p className="text-gray-600 leading-relaxed">{member.description}</p>

                    {/* Hover Effect Line */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-amber-500"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
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
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
          >
            {/* Vision */}
            <motion.div
              variants={slideInLeft}
              className="group relative"
            >
              <div className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />

                <div className="relative z-10">
                  <motion.div
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Target className="w-10 h-10 text-white" />
                  </motion.div>

                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/10 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm border border-blue-500/20">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    Our Vision
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-6">
                    Shaping Tomorrow's <span className="text-amber-400">Leaders</span>
                  </h3>

                  <p className="text-xl text-blue-200 leading-relaxed">
                    To be a leading educational institution that nurtures innovative thinkers,
                    ethical leaders, and compassionate global citizens who contribute
                    meaningfully to society and drive positive change in the world.
                  </p>

                  <motion.div
                    className="flex items-center gap-2 mt-8 text-amber-400"
                    initial={{ x: 0 }}
                    whileHover={{ x: 10 }}
                  >
                    <span className="font-medium">Explore Our Vision</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Mission */}
            <motion.div
              variants={slideInRight}
              className="group relative"
            >
              <div className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />

                <div className="relative z-10">
                  <motion.div
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Heart className="w-10 h-10 text-white" />
                  </motion.div>

                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/10 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm border border-amber-500/20">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Our Mission
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-6">
                    Excellence in <span className="text-amber-400">Education</span>
                  </h3>

                  <p className="text-xl text-blue-200 leading-relaxed">
                    To provide a holistic education that fosters intellectual growth, moral values,
                    and practical skills, preparing students to excel in a rapidly changing world
                    while maintaining strong ethical foundations and social responsibility.
                  </p>

                  <motion.div
                    className="flex items-center gap-2 mt-8 text-amber-400"
                    initial={{ x: 0 }}
                    whileHover={{ x: 10 }}
                  >
                    <span className="font-medium">Discover Our Mission</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* School History Timeline */}
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
              Our Journey
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-gray-900">
              40 Years of <span className="text-blue-600">Excellence</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four decades of commitment to educational excellence and innovation
            </p>
          </motion.div>

          <div className="relative max-w-6xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 via-amber-500 to-blue-500" />

            {/* Timeline Items */}
            {timeline.map((item, index) => {
              const Icon = item.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={isEven ? slideInLeft : slideInRight}
                  transition={{ delay: index * 0.2 }}
                  className={`flex items-center ${isEven ? 'justify-end' : 'justify-start'} mb-16`}
                >
                  <div className={`w-1/2 ${isEven ? 'pr-12' : 'pl-12'}`}>
                    <div className="group relative">
                      <div className="relative p-8 rounded-3xl bg-white border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                        {/* Content */}
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-4">
                            <motion.div
                              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                              whileHover={{ rotate: 5 }}
                            >
                              <Icon className="w-8 h-8 text-white" />
                            </motion.div>
                            <div>
                              <motion.div
                                className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                              >
                                {item.year}
                              </motion.div>
                              <div className="text-sm text-gray-500">Milestone</div>
                            </div>
                          </div>

                          <p className="text-gray-700 text-lg font-medium">
                            {item.event}
                          </p>

                          {/* Connector Circle */}
                          <div className={`absolute top-1/2 ${isEven ? '-right-6' : '-left-6'} transform -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br ${item.color} border-4 border-white shadow-lg`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-amber-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
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
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-100 to-amber-50 rounded-full text-sm font-semibold mb-6 border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Our Foundation
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-gray-900">
              Our Core <span className="text-amber-600">Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do and define who we are
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInScale}
                  className="group relative"
                >
                  <div className="relative p-8 rounded-3xl bg-white border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    {/* Background Animation */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                      animate={{
                        background: [
                          `linear-gradient(135deg, var(--tw-gradient-stops) 0%, transparent 100%)`,
                          `linear-gradient(135deg, transparent 0%, var(--tw-gradient-stops) 100%)`,
                          `linear-gradient(135deg, var(--tw-gradient-stops) 0%, transparent 100%)`,
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />

                    <div className="relative z-10">
                      <motion.div
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="w-10 h-10 text-white" />
                      </motion.div>

                      <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
                        {value.title}
                      </h3>

                      <p className="text-gray-600 text-center leading-relaxed">
                        {value.description}
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

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 shadow-lg">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <span className="text-gray-700 font-medium">
                These values guide every decision we make and every action we take
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(600px circle at 20% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
              'radial-gradient(600px circle at 80% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
              'radial-gradient(600px circle at 20% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-amber-600/10 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-amber-500/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Join Our Legacy
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text text-transparent">
              Ready to Be Part of <br />
              Our Story?
            </h2>

            <p className="text-xl text-blue-200 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students who have found their path to success through
              our comprehensive education system.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300"
              >
                Apply for Admission
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white hover:text-blue-900 transition-all duration-300"
              >
                Schedule a Visit
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 pt-8 border-t border-white/10"
            >
              <div className="flex flex-wrap justify-center items-center gap-8 text-white/70">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Proven Academic Excellence</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Holistic Development Focus</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Safe & Nurturing Environment</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-amber-400/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + Math.sin(i) * 40}%`,
            }}
            animate={{
              y: [0, -40, 0],
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