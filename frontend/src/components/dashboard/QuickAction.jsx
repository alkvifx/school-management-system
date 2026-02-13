'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Compact, thumb-friendly quick action tile for student/teacher dashboards.
 * Mobile-first, low-motion, uses design tokens from globals (no generic fonts).
 */
export function QuickAction({
  href,
  icon: Icon,
  label,
  description,
  badge,
  accentClass = 'from-blue-500 to-cyan-500',
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Link
        href={href}
        className="group block h-full rounded-2xl border border-[hsl(var(--app-border))] bg-[hsl(var(--app-surface))] p-4 shadow-[var(--app-shadow)] transition-all duration-200 hover:shadow-[var(--app-shadow-lg)]"
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white',
              accentClass,
            )}
          >
            {Icon && <Icon className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="truncate text-sm font-semibold text-[hsl(var(--app-text))]"
                style={{ fontFamily: 'var(--app-display)' }}
              >
                {label}
              </span>
              {badge && (
                <span className="rounded-full bg-[hsl(var(--app-accent-muted))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--app-accent))]">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 line-clamp-2 text-xs text-[hsl(var(--app-text-muted))]">
                {description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

