'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
  loading = false,
  ...props
}) {
  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        'group relative overflow-hidden rounded-[var(--app-radius-lg)] p-6',
        'bg-[hsl(var(--app-surface))] shadow-[var(--app-shadow)] border border-[hsl(var(--app-border))]',
        'transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {/* Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[hsl(var(--app-accent-muted))]/0 group-hover:to-[hsl(var(--app-accent-muted))]/30 transition-all duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-[hsl(var(--app-text-muted))] mb-1">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className={cn(
                  'text-3xl font-bold text-[hsl(var(--app-text))]',
                  typeof value !== 'number' && 'text-2xl'
                )}>
                  {value}
                </h3>
                {trend && trendValue && (
                  <span
                    className={cn(
                      'text-sm font-medium flex items-center gap-1',
                      trend === 'up' ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {trend === 'up' ? '↑' : '↓'} {trendValue}
                  </span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className="p-3 rounded-[var(--app-radius)] bg-[hsl(var(--app-accent))] text-white shadow-[var(--app-shadow)] group-hover:scale-105 transition-transform duration-300">
              <Icon size={24} />
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-[hsl(var(--app-text-muted))] mt-2">{description}</p>
        )}
      </div>
    </motion.div>
  );
}
