/**
 * Shared Framer Motion variants — Design System
 * Use across all pages for consistent animation language.
 */

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/** Lightweight tap feedback — use for buttons/cards */
export const tapScale = { scale: 0.98 };

/** Duration presets */
export const motionConfig = {
  fast: { duration: 0.15 },
  normal: { duration: 0.25 },
  slow: { duration: 0.4 },
};
