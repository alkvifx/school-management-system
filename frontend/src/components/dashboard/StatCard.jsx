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
        'group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm',
        'border border-gray-100',
        'transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {/* Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-amber-50/0 group-hover:from-blue-50/50 group-hover:to-amber-50/30 transition-all duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className={cn(
                  'text-3xl font-bold',
                  typeof value === 'number' ? 'text-gray-900' : 'text-gray-900 text-2xl'
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 text-white shadow-md group-hover:scale-110 transition-transform duration-300">
              <Icon size={24} />
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-2">{description}</p>
        )}
      </div>
    </motion.div>
  );
}
