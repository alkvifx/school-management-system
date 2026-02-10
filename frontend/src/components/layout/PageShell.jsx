'use client';

import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/src/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Shared page wrapper — app background + staggered motion.
 * Use for authenticated content pages.
 */
export function PageShell({ children, className, maxWidth = 'max-w-2xl' }) {
  return (
    <div
      className={cn('app-bg-texture min-h-screen', className)}
      style={{ fontFamily: 'var(--app-body)' }}
    >
      <div className={cn('relative z-10 mx-auto px-4 pb-24 pt-4 sm:pb-6 sm:pt-6', maxWidth)}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Section title using display font.
 */
export function SectionTitle({ children, className }) {
  return (
    <motion.h2
      variants={itemVariants}
      className={cn(
        'text-sm font-semibold text-[hsl(var(--app-text))] sm:text-base',
        className
      )}
      style={{ fontFamily: 'var(--app-display)' }}
    >
      {children}
    </motion.h2>
  );
}
