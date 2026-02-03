'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Users,
  Monitor,
  Trophy,
  BookOpen,
  Calendar,
  ArrowRight,
  Quote,
  GraduationCap,
  Award,
  School,
  AwardIcon,
  Sparkles,
  Star,
  Target,
  Heart,
  Zap,
  Globe,
  Brain,
  Shield,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { HERO_SLIDES, HIGHLIGHTS, ANNOUNCEMENTS, GALLERY_IMAGES, SCHOOL_INFO } from '@/lib/data';

// Enhanced animations
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
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
  y: [0, -15, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const iconMap = {
  Users: Users,
  Monitor: Monitor,
  Trophy: Trophy,
  AwardIcon: AwardIcon,
};

const floatingShapes = () => (
  <>
    <motion.div
      className="absolute top-1/4 left-10 w-6 h-6 bg-gradient-to-r from-amber-500/30 to-amber-600/30 rounded-full blur-sm"
      animate={{
        y: [0, -30, 0],
        x: [0, 20, 0],
        rotate: 360
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    <motion.div
      className="absolute bottom-1/4 right-10 w-8 h-8 bg-gradient-to-r from-blue-500/20 to-blue-700/20 rounded-full blur-sm"
      animate={{
        y: [0, 40, 0],
        x: [0, -30, 0],
        rotate: -360
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  </>
);

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  useEffect(() => {
    if (!isHovering) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isHovering]);

  return (
    <div ref={containerRef} className="overflow-hidden">
      {/* Hero Section - Enhanced */}
      <section className="relative min-h-[700px] overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-blue-950/50" />
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
          {floatingShapes()}

          {/* Gradient Orbs */}
          <motion.div
            className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-amber-500/20 to-amber-600/10 rounded-full blur-3xl"
            animate={floatingAnimation}
          />
          <motion.div
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-blue-800/10 rounded-full blur-3xl"
            animate={{
              ...floatingAnimation,
              transition: { ...floatingAnimation.transition, delay: 1 }
            }}
          />
        </div>

        {/* Slides */}
        <AnimatePresence mode="wait">
          {HERO_SLIDES.map((slide, index) =>
            index === currentSlide && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <motion.div
                  style={{ y: springY }}
                  className="absolute inset-0"
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/85 to-blue-950/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-transparent to-blue-950/50" />
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-30 container mx-auto px-4 min-h-[700px] flex items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white/90">Premium Education Since 1985</span>
            </motion.div>

            <motion.h1
              key={`title-${currentSlide}`}
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text text-transparent"
            >
              {HERO_SLIDES[currentSlide].title}
            </motion.h1>

            <motion.p
              key={`subtitle-${currentSlide}`}
              variants={fadeInUp}
              className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl leading-relaxed"
            >
              {HERO_SLIDES[currentSlide].subtitle}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-4 items-center"
            >
              <Link
                href="/contact"
                className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 flex items-center gap-3 overflow-hidden"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ opacity: 0.2 }}
                />
                <span className="relative z-10">Apply Now</span>
                <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/about"
                className="group px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white hover:text-blue-900 transition-all duration-300 hover:border-white relative overflow-hidden"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <span className="relative z-10">Learn More</span>
                <motion.div
                  className="absolute inset-0 bg-white rounded-full"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>

              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2 text-white/80"
              >
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span className="text-sm">Rated #1 in Education Excellence</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Hero Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute right-0 bottom-0 hidden lg:block"
          >
            <div className="relative w-[600px] h-[600px]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-amber-500/10 rounded-full blur-xl"
              />
              <img
                src="/images/hero-illustration.svg"
                alt="Education Illustration"
                className="relative z-10 w-full h-full object-contain"
              />
            </div>
          </motion.div>
        </div>

        {/* Slide Indicators - Enhanced */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-4">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="group relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <motion.div
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                animate={{
                  scale: index === currentSlide ? [1, 1.2, 1] : 1
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
              {index === currentSlide && (
                <motion.div
                  className="absolute -inset-2 border-2 border-amber-500/30 rounded-full"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-sm font-medium">Scroll</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Quick Stats - Premium */}
     <section className="relative mt-10 pb-10 z-40">
  <div className="container mx-auto px-4">
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className="grid grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {[
        {
          value: "40+",
          label: "Years of Excellence",
          icon: Clock,
          color: "from-amber-500 to-amber-600",
          delay: 0,
        },
        {
          value: "2500+",
          label: "Happy Students",
          icon: Heart,
          color: "from-pink-500 to-rose-600",
          delay: 0.1,
        },
        {
          value: "150+",
          label: "Qualified Teachers",
          icon: Award,
          color: "from-blue-500 to-blue-600",
          delay: 0.2,
        },
        {
          value: "95%",
          label: "Merit Students",
          icon: Target,
          color: "from-emerald-500 to-emerald-600",
          delay: 0.3,
        },
      ].map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Link href="/about" key={index}>
            <motion.div
              variants={fadeInScale}
              transition={{ delay: stat.delay }}
              whileHover={{ y: -6 }}
              className="group cursor-pointer"
            >
              <div className="relative p-8 rounded-3xl bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">

                {/* subtle hover shine */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-gray-100/70 to-transparent" />

                <div className="relative z-10">
                  {/* icon */}
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  {/* value */}
                  <div className="text-5xl font-extrabold text-gray-900 mb-2">
                    {stat.value}
                  </div>

                  {/* label */}
                  <div className="text-lg font-semibold text-gray-600">
                    {stat.label}
                  </div>

                  {/* hover link */}
                  <div className="mt-4 text-sm text-gray-500 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </motion.div>
  </div>
</section>


      {/* About Summary - Enhanced */}
      <section className="py-24 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={slideInLeft}>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/10 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-400" />
                About Our Legacy
              </div>

              <h2 className="text-5xl font-bold mb-8 leading-tight bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                Shaping Future <br />
                <span className="text-amber-400">Leaders Since 1985</span>
              </h2>

              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {SCHOOL_INFO.name} is committed to providing world-class education that nurtures
                intellectual curiosity, critical thinking, and moral values. Our holistic approach
                ensures every student reaches their full potential.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                {[
                  { icon: Brain, text: 'Critical Thinking' },
                  { icon: Shield, text: 'Moral Values' },
                  { icon: Globe, text: 'Global Exposure' },
                  { icon: Zap, text: 'Innovation Focus' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-semibold text-white">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <Link
                href="/about"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300"
              >
                Explore Our Legacy
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>

            <motion.div variants={slideInRight} className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <motion.img
                  src="/images/school1.jpg"
                  alt="School Campus"
                  className="w-full h-[600px] object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/50 via-transparent to-transparent" />
              </div>

              {/* Floating Cards */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-2xl max-w-xs"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-900">#1</div>
                    <div className="text-sm text-gray-600">Ranked School</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -top-6 -right-6 bg-white rounded-2xl p-6 shadow-2xl max-w-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-900">100%</div>
                    <div className="text-sm text-gray-600">Placement Rate</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Principal's Message - Enhanced */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-amber-50">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-500/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={slideInLeft} className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <img
                    src="/images/principal.jpg"
                    alt="Principal"
                    className="w-full h-[600px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent" />
                </motion.div>

                {/* Floating Quote */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl"
                >
                  <Quote className="w-12 h-12 text-white" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div variants={slideInRight} className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-50 rounded-full text-sm font-semibold mb-6 border border-amber-200">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Principal's Message
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-gray-900">
                Nurturing <span className="text-amber-600">Excellence</span> <br />
                in Every Child
              </h2>

              <div className="relative mb-8">
                <Quote className="absolute -top-4 -left-4 w-12 h-12 text-amber-500/20" />
                <p className="text-xl text-gray-600 mb-6 leading-relaxed italic pl-8">
                  "Education is not just about academics; it's about building character, fostering
                  creativity, and developing lifelong learners. At {SCHOOL_INFO.name}, we believe
                  every child is unique and deserves the opportunity to shine."
                </p>
              </div>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our dedicated team works tirelessly to create an environment where students feel
                valued, challenged, and inspired. We focus on holistic development, ensuring our
                students excel not only academically but also in sports, arts, and social
                responsibility.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-white p-8 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">P</span>
                  </div>
                  <div>
                    <p className="font-bold text-xl text-gray-900">Principal ka naam</p>
                    <p className="text-gray-600">Principal</p>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-amber-500 fill-current" />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">40+ Years Experience</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Highlights - Premium */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-blue-950 to-blue-900">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-blue-800/20 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-blue-600/10 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-blue-500/20">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Why Choose Us
            </div>
            <h2 className="text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              What Makes Us <br />
              <span className="text-amber-400">Special</span>
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Discover the key features that set us apart in delivering premium education
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {HIGHLIGHTS.map((highlight, index) => {
              const Icon = iconMap[highlight.icon];
              return (
                <Link href={highlight.link} key={index}>
                  <motion.div
                    variants={fadeInScale}
                    className="group relative"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, rotateY: 5 }}
                      className="relative p-8 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden h-full"
                    >
                      {/* Hover Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />

                      <div className="relative z-10">
                        <motion.div
                          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="w-10 h-10 text-white" />
                        </motion.div>

                        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors">
                          {highlight.title}
                        </h3>

                        <p className="text-blue-200 mb-6">
                          {highlight.description}
                        </p>

                        <motion.div
                          className="inline-flex items-center gap-2 text-amber-400 font-medium"
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                        >
                          Learn more
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </div>

                      {/* Corner Accent */}
                      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent transform rotate-45 translate-x-16" />
                      </div>
                    </motion.div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Announcements - Premium */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
        {/* Floating Elements */}
        {floatingShapes()}

        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-100 to-amber-50 rounded-full text-sm font-semibold mb-6 border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Latest Updates
            </div>
            <h2 className="text-5xl font-bold mb-6 leading-tight text-gray-900">
              Announcements <br />
              <span className="text-blue-600">& News</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
          >
            {ANNOUNCEMENTS.slice(0, 4).map((announcement, index) => (
              <motion.div
                key={announcement.id}
                variants={fadeInScale}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className={`relative p-8 rounded-3xl overflow-hidden transition-all duration-300 ${
                  announcement.important
                    ? 'bg-gradient-to-br from-amber-50 via-amber-50/80 to-white border-2 border-amber-200 shadow-xl'
                    : 'bg-white border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-2xl'
                }`}>
                  {/* Gradient Background */}
                  {announcement.important && (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5" />
                  )}

                  <div className="relative z-10">
                    <div className="flex items-start gap-6">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg ${
                          announcement.important
                            ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                        }`}
                      >
                        <div className="text-white text-xs font-bold">
                          {new Date(announcement.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                        </div>
                        <div className="text-white text-3xl font-bold">
                          {new Date(announcement.date).getDate()}
                        </div>
                      </motion.div>

                      <div className="flex-1">
                        {announcement.important && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-full font-semibold mb-3"
                          >
                            <Zap className="w-3 h-3" />
                            Important
                          </motion.span>
                        )}

                        <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {announcement.title}
                        </h3>

                        <p className="text-gray-600 mb-4">
                          {announcement.description}
                        </p>

                        <motion.div
                          className="inline-flex items-center gap-2 text-blue-600 font-medium"
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                        >
                          Read more
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16"
          >
            <Link
              href="/notices"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300"
            >
              View All Notices
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Gallery Preview - Premium */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950">
        {/* Animated Background */}
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
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-blue-600/10 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-blue-500/20">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Campus Life
            </div>
            <h2 className="text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Photo <span className="text-amber-400">Gallery</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              A glimpse into the vibrant life at our school
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 gap-6"
          >
            {GALLERY_IMAGES.slice(0, 6).map((image, index) => (
              <motion.div
                key={image.id}
                variants={fadeInScale}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="group relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer h-80"
              >
                <motion.img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-white"
                  >
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full text-sm font-semibold mb-3">
                      {image.category}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
                    <p className="text-gray-300">Click to view full image</p>
                  </motion.div>
                </div>

                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16"
          >
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300"
            >
              Explore Full Gallery
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Premium */}
      <section className="relative py-32 overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            animate={{
              background: [
                'radial-gradient(600px circle at 20% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
                'radial-gradient(600px circle at 80% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
                'radial-gradient(600px circle at 20% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
              ]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInScale}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Icon with Animation */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block p-6 rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 mb-8"
            >
              <GraduationCap className="w-16 h-16 text-amber-400" />
            </motion.div>

            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-amber-600/10 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-amber-500/20">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Limited Seats Available
            </div>

            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-white to-amber-300 bg-clip-text text-transparent">
              Ready to Join <br />
              Our Family?
            </h2>

            <p className="text-xl md:text-2xl text-blue-200 mb-12 max-w-2xl mx-auto leading-relaxed">
              Admissions are now open for the academic year 2025-26.
              Give your child the gift of premium education.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <Link
                href="/contact"
                className="group relative px-10 py-5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 flex items-center gap-3 overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <span className="relative z-10">Apply Now</span>
                <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/contact"
                className="group px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white hover:text-blue-900 transition-all duration-300 relative overflow-hidden"
              >
                <span className="relative z-10">Schedule a Visit</span>
                <motion.div
                  className="absolute inset-0 bg-white rounded-full"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 pt-8 border-t border-white/10"
            >
              <div className="flex flex-wrap justify-center items-center gap-8 text-white/70">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>100% Safe Environment</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>ISO Certified</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Parent Recommended</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-1/4 left-10 w-4 h-4 bg-amber-400 rounded-full"
          animate={{
            y: [0, -30, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-20 w-6 h-6 bg-blue-400 rounded-full"
          animate={{
            y: [0, 40, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </section>
    </div>
  );
}