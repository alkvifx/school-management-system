'use client';

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
// import PwaInstallPrompt from '@/src/components/PwaInstallPrompt';
import {
  ChevronRight,
  Users,
  Monitor,
  Trophy,
  ArrowRight,
  GraduationCap,
  Award,
  Clock,
  Heart,
  Target,
  Brain,
  Shield,
  Globe,
  Zap,
  Sparkles,
  Star,
  CheckCircle,
} from 'lucide-react';
import { HERO_SLIDES, HIGHLIGHTS, ANNOUNCEMENTS, GALLERY_IMAGES, SCHOOL_INFO } from '@/lib/data';
import { publicContentService } from '@/src/services/publicContent.service';
import { useAuth } from '@/src/context/auth.context';
import { ROLES } from '@/src/utils/constants';

// ==================== OPTIMIZED ANIMATIONS ====================
const prefersReducedMotion = typeof window !== 'undefined' ?
  window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

const fadeInUp = prefersReducedMotion ? {} : {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const fadeIn = prefersReducedMotion ? {} : {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4
    }
  }
};

const slideInLeft = prefersReducedMotion ? {} : {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const slideInRight = prefersReducedMotion ? {} : {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// ==================== MEMOIZED COMPONENTS ====================
const SlideIndicator = memo(({ slides, currentSlide, onSlideChange }) => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
      {slides.map((_, index) => (
        <button
          key={index}
          onClick={() => onSlideChange(index)}
          className="w-2.5 h-2.5 rounded-full transition-all bg-white/50 hover:bg-white/80 data-[active=true]:bg-white"
          data-active={index === currentSlide}
        />
      ))}
    </div>
  );
});

SlideIndicator.displayName = 'SlideIndicator';

const StatCard = memo(({ stat }) => {
  const Icon = stat.icon;

  return (
    <Link href="/about">
      <div className="group cursor-pointer">
        <div className="relative p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="relative">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-base font-semibold text-gray-600">{stat.label}</div>
          </div>
        </div>
      </div>
    </Link>
  );
});

StatCard.displayName = 'StatCard';

const FeatureItem = memo(({ item }) => {
  const Icon = item.icon;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="font-semibold text-white text-sm">{item.text}</span>
    </div>
  );
});

FeatureItem.displayName = 'FeatureItem';

const HighlightCard = memo(({ highlight }) => {
  const Icon = highlight.icon;

  return (
    <Link href={highlight.link}>
      <div className="group">
        <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-200 h-full">
          <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-3">{highlight.title}</h3>
          <p className="text-blue-200 text-sm mb-4">{highlight.description}</p>
          <div className="inline-flex items-center gap-1 text-amber-400 font-medium text-sm">
            Learn more
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
});

HighlightCard.displayName = 'HighlightCard';

const GalleryImage = memo(({ image }) => {
  return (
    <div className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer h-64">
      <Image
        src={image.url}
        alt={image.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 p-4 text-white">
          <div className="px-3 py-1 bg-amber-600 rounded-full text-xs font-semibold mb-2 inline-block">
            {image.category}
          </div>
          <h3 className="text-lg font-bold">{image.title}</h3>
        </div>
      </div>
    </div>
  );
});

GalleryImage.displayName = 'GalleryImage';

// ==================== LAZY LOADED SECTIONS ====================
const LazyGallery = dynamic(() => Promise.resolve(({ images }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {images.slice(0, 6).map((image) => (
      <GalleryImage key={image.id} image={image} />
    ))}
  </div>
)), { ssr: false });

const LazyStats = dynamic(() => Promise.resolve(({ stats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {stats.map((stat, index) => (
      <StatCard key={index} stat={stat} />
    ))}
  </div>
)), { ssr: false });

// ==================== MAIN COMPONENT ====================
export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [publicContent, setPublicContent] = useState(null);
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();
  const router = useRouter();

  // Memoized values
  const stats = useMemo(() => {
    if (publicContent?.stats) {
      return [
        {
          value: publicContent.stats.yearsOfExcellence || "40+",
          label: "Years of Excellence",
          icon: Clock,
          color: "from-amber-500 to-amber-600",
        },
        {
          value: publicContent.stats.studentsCount || "2500+",
          label: "Happy Students",
          icon: Heart,
          color: "from-pink-500 to-rose-600",
        },
        {
          value: publicContent.stats.teachersCount || "150+",
          label: "Qualified Teachers",
          icon: Award,
          color: "from-blue-500 to-blue-600",
        },
        {
          value: "95%",
          label: "Merit Students",
          icon: Target,
          color: "from-emerald-500 to-emerald-600",
        },
      ];
    }

    return [
      {
        value: "40+",
        label: "Years of Excellence",
        icon: Clock,
        color: "from-amber-500 to-amber-600",
      },
      {
        value: "2500+",
        label: "Happy Students",
        icon: Heart,
        color: "from-pink-500 to-rose-600",
      },
      {
        value: "150+",
        label: "Qualified Teachers",
        icon: Award,
        color: "from-blue-500 to-blue-600",
      },
      {
        value: "95%",
        label: "Merit Students",
        icon: Target,
        color: "from-emerald-500 to-emerald-600",
      },
    ];
  }, [publicContent]);

  const features = useMemo(
    () => [
      { icon: Brain, text: 'Critical Thinking' },
      { icon: Shield, text: 'Moral Values' },
      { icon: Globe, text: 'Global Exposure' },
      { icon: Zap, text: 'Innovation Focus' },
    ],
    []
  );

  const announcements = useMemo(
    () => publicContent?.announcements || ANNOUNCEMENTS,
    [publicContent]
  );

  const galleryImages = useMemo(() => {
    if (publicContent?.gallery?.images?.length) {
      return publicContent.gallery.images.map((img, idx) => ({
        id: idx,
        url: img.url,
        title: img.title || 'School Life',
        category: img.category || 'Events',
      }));
    }
    return GALLERY_IMAGES;
  }, [publicContent]);

  const legacyTitle =
    publicContent?.legacy?.title || 'About Our Legacy';
  const legacyLines =
    publicContent?.legacy?.lines && publicContent.legacy.lines.length > 0
      ? publicContent.legacy.lines
      : [
          `${SCHOOL_INFO.name} is committed to providing world-class education that nurtures intellectual curiosity, critical thinking, and moral values.`,
        ];
  const legacyImage =
    publicContent?.legacy?.mainGateImageUrl || '/images/school1.jpg';

  const principalName =
    publicContent?.principalSection?.name || 'Principal Name';
  const principalMessageLines =
    publicContent?.principalSection?.messageLines && publicContent.principalSection.messageLines.length > 0
      ? publicContent.principalSection.messageLines
      : [
          'Education is not just about academics; it is about building character, fostering creativity, and developing lifelong learners.',
        ];
  const principalPhoto =
    publicContent?.principalSection?.photoUrl || '/images/principal.jpg';

  // Map highlight icon strings to actual Lucide icons
  const highlightIconMap = {
    Users,
    Monitor,
    Trophy,
    AwardIcon: Award,
  };

  // Optimized handlers
  const handleSlideChange = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Effects
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load public content for landing page sections (navbar/footer use static SCHOOL_INFO for now)
  useEffect(() => {
    let isMounted = true;
    publicContentService
      .getPublicContent()
      .then((data) => {
        if (isMounted) {
          setPublicContent(data);
        }
      })
      .catch(() => {
        // Fail silently; UI will fall back to static constants
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (shouldReduceMotion || isMobile) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion, isMobile, HERO_SLIDES.length]);

  return (
    <div ref={containerRef} className="min-h-screen overflow-x-hidden overflow-y-auto">
      {/* <PwaInstallPrompt delayMs={2500} /> */}
      {/* Hero Section - Simplified */}
      <section className="relative min-h-[600px] overflow-hidden bg-blue-950">
        {/* Static Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-blue-900/50" />
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5" />
        </div>

        {/* Slides - Optimized */}
        <AnimatePresence mode="wait">
          {HERO_SLIDES.map((slide, index) =>
            index === currentSlide && (
              <motion.div
                key={slide.id}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/80 to-blue-950/70" />
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-30 container mx-auto px-4 min-h-[600px] flex items-center">
          <motion.div
            initial={shouldReduceMotion ? false : "hidden"}
            animate="visible"
            variants={fadeInUp}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full mb-4">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-medium text-white/90">
                Premium Education Since{' '}
                {publicContent?.banner?.educatingSince || SCHOOL_INFO.established || '1985'}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-white">
              {publicContent?.banner?.headingPrimary || HERO_SLIDES[currentSlide].title}
            </h1>

            <p className="text-lg md:text-xl mb-6 text-blue-100 max-w-2xl leading-relaxed">
              {publicContent?.banner?.description || HERO_SLIDES[currentSlide].subtitle}
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              <Link
                href="/contact"
                className="group relative px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <span>Apply Now</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/about"
                className="group px-6 py-3 bg-white/10 border border-white/30 text-white rounded-full font-semibold hover:bg-white hover:text-blue-900 transition-all duration-200"
              >
                <span>Learn More</span>
              </Link>
            </div>
          </motion.div>
        </div>

        <SlideIndicator
          slides={HERO_SLIDES}
          currentSlide={currentSlide}
          onSlideChange={handleSlideChange}
        />
      </section>

      {/* Quick Stats - Lazy Loaded */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <LazyStats stats={stats} />
        </div>
      </section>

      {/* About Summary - Simplified */}
      <section className="py-16 bg-blue-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="grid lg:grid-cols-2 gap-8 items-center"
          >
            <motion.div variants={slideInLeft}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-full text-sm font-semibold mb-4">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {legacyTitle}
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-white">
                Shaping Future Leaders Since{' '}
                {publicContent?.banner?.educatingSince || SCHOOL_INFO.established || '1985'}
              </h2>

              <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                {legacyLines.join(' ')}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {features.map((item, index) => (
                  <FeatureItem key={index} item={item} />
                ))}
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all duration-200"
              >
                Explore Our Legacy
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div variants={slideInRight} className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={legacyImage}
                  alt="School Campus"
                  width={600}
                  height={400}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full h-auto object-cover"
                  priority={false}
                  loading="lazy"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Principal's Message */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="grid lg:grid-cols-2 gap-8 items-center"
          >
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={principalPhoto}
                  alt="Principal"
                  width={600}
                  height={400}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full h-auto object-cover"
                  priority={false}
                  loading="lazy"
                />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-full text-sm font-semibold mb-4">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Principal's Message
              </div>

              <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-900">
                Nurturing Excellence in Every Child
              </h2>

              <div className="relative mb-6">
                <p className="text-lg text-gray-600 mb-4 leading-relaxed italic">
                  {`"${principalMessageLines.join(' ')}"`}
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-white">P</span>
                  </div>
                  <div>
                      <p className="font-bold text-lg text-gray-900">{principalName}</p>
                      <p className="text-gray-600">
                        {publicContent?.principalSection?.designation || 'Principal'}
                      </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 bg-blue-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-white">
              What Makes Us Special
            </h2>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              Discover the key features that set us apart
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {HIGHLIGHTS.map((highlight, index) => (
              <HighlightCard
                key={index}
                highlight={{
                  ...highlight,
                  icon: highlightIconMap[highlight.icon] || Star,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-gray-900">
              Announcements & News
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {announcements.slice(0, 4).map((announcement) => (
              <div key={announcement.id} className="group">
                <div className={`relative p-6 rounded-xl ${
                  announcement.important
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center ${
                      announcement.important ? 'bg-amber-500' : 'bg-blue-500'
                    }`}>
                      <div className="text-white text-xs font-bold">
                        {new Date(announcement.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                      </div>
                      <div className="text-white text-2xl font-bold">
                        {new Date(announcement.date).getDate()}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {announcement.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {announcement.description}
                      </p>
                      <div className="inline-flex items-center gap-1 text-blue-600 font-medium text-sm">
                        Read more
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/notices"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all duration-200"
            >
              View All Notices
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Preview - Lazy Loaded */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-white">
              Photo Gallery
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              A glimpse into the vibrant life at our school
            </p>
          </motion.div>

          <LazyGallery images={galleryImages} />

          <div className="text-center mt-12">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-full font-semibold hover:bg-amber-600 transition-all duration-200"
            >
              Explore Full Gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-white">
              Ready to Join Our Family?
            </h2>

            <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Admissions are now open for the academic year 2025-26.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-bold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                Apply Now
                <ChevronRight className="w-5 h-5" />
              </Link>

              <Link
                href="/contact"
                className="px-8 py-3 bg-white/10 border border-white/30 text-white rounded-full font-bold hover:bg-white hover:text-blue-900 transition-all duration-200"
              >
                Schedule a Visit
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-wrap justify-center items-center gap-6 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>100% Safe Environment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>ISO Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Parent Recommended</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Principal inline edit shortcut – only visible to Principal users */}
      {user?.role === ROLES.PRINCIPAL && (
        <button
          type="button"
          onClick={() => router.push('/principal/website/public-content')}
          className="fixed bottom-24 right-4 z-40 rounded-full bg-blue-600 text-white px-4 py-2 text-xs font-semibold shadow-lg hover:bg-blue-700"
        >
          Edit Public Content
        </button>
      )}
    </div>
  );
}