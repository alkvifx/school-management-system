// DashboardCard.js
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function DashboardCard({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  icon: Icon,
  iconColor = 'text-blue-600',
  ...props
}) {
  return (
    <motion.div
      variants={cardVariants}
      className={cn('w-full', className)}
      {...props}
    >
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {(title || description) && (
          <CardHeader className={cn('pb-5', headerClassName)}>
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={cn("p-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100", iconColor)}>
                  <Icon className={cn("h-5 w-5", iconColor)} />
                </div>
              )}
              <div className="flex-1">
                {title && (
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {title}
                    {description && (
                      <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        Beta
                      </span>
                    )}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className="text-sm text-gray-600 mt-1">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        )}
        <CardContent className={cn('pt-0', contentClassName)}>
          {children}
        </CardContent>

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/5 opacity-0 hover:opacity-100 rounded-2xl transition-opacity duration-300 pointer-events-none" />
      </Card>
    </motion.div>
  );
}