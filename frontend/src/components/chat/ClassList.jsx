// ClassList.js (Updated for mobile)
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Users,
  MessageSquare,
  Clock,
  ChevronRight,
  Shield,
  GraduationCap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * ClassList component - Left panel showing available classes
 */
export default function ClassList({
  classes,
  selectedClass,
  onSelectClass,
  loading,
  isMobile = false
}) {
  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 p-3">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium mb-2">No classes available</p>
          <p className="text-sm text-gray-500">Classes will appear here when assigned</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-white to-gray-50">
      <div className="overflow-y-auto h-full">
        <div className="p-2 space-y-2">
          <AnimatePresence>
            {classes.map((classItem, index) => {
              const classId = classItem._id || classItem.id;
              const className = classItem.name || `${classItem.grade || ''}-${classItem.section || ''}`.trim();
              const isSelected = (selectedClass?._id || selectedClass?.id) === classId;
              const unreadCount = Math.floor(Math.random() * 5);

              return (
                <motion.button
                  key={classId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: isMobile ? 0 : 4 }}
                  onClick={() => onSelectClass(classItem)}
                  className={cn(
                    'w-full p-3 text-left rounded-xl transition-all duration-200',
                    isSelected
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 shadow-md'
                      : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-transparent hover:border-gray-200'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Class Icon */}
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                        : "bg-gradient-to-br from-gray-100 to-gray-200"
                    )}>
                      <BookOpen className="h-4 w-4" />
                    </div>

                    {/* Class Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={cn(
                          "font-bold truncate text-sm",
                          isSelected ? "text-blue-900" : "text-gray-900"
                        )}>
                          {className}
                        </h3>
                        {unreadCount > 0 && (
                          <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs h-4 min-w-[16px]">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {classItem.section && (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {classItem.section}
                          </span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          28
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    {!isMobile && (
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        isSelected ? "text-blue-600 rotate-90" : "text-gray-400"
                      )} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}