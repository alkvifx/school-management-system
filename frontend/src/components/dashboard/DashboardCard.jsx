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
  iconColor = 'text-[hsl(var(--app-accent))]',
  ...props
}) {
  return (
    <motion.div
      variants={cardVariants}
      className={cn('w-full', className)}
      {...props}
    >
      <Card className="rounded-[var(--app-radius-lg)] border-[hsl(var(--app-border))] bg-[hsl(var(--app-surface))] shadow-[var(--app-shadow)] hover:shadow-[var(--app-shadow-lg)] transition-all duration-300">
        {(title || description) && (
          <CardHeader className={cn('pb-5', headerClassName)}>
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={cn("p-2 rounded-[var(--app-radius)] bg-[hsl(var(--app-accent-muted))]", iconColor)}>
                  <Icon className={cn("h-5 w-5", iconColor)} />
                </div>
              )}
              <div className="flex-1">
                {title && (
                  <CardTitle className="text-xl font-bold text-[hsl(var(--app-text))] flex items-center gap-2">
                    {title}
                    {description && (
                      <span className="text-xs font-normal text-[hsl(var(--app-text-muted))] bg-[hsl(var(--app-accent-muted))] px-2 py-0.5 rounded-full">
                        Beta
                      </span>
                    )}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className="text-sm text-[hsl(var(--app-text-muted))] mt-1">
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
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[hsl(var(--app-accent))]/5 opacity-0 hover:opacity-100 rounded-[var(--app-radius-lg)] transition-opacity duration-300 pointer-events-none" />
      </Card>
    </motion.div>
  );
}