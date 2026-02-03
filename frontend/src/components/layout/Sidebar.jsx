'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/auth.context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  School,
  UserCog,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  ClipboardList,
  Award,
  LogOut,
  Building2,
  FileText,
  Image,
  Bell,
  X,
  Menu,
  MessageSquare,
  Landmark,
  ChevronRight,
  Settings,
  Calendar,
  CreditCard,
  HelpCircle,
  UserCircle,
  EyeOff,
} from 'lucide-react';
import { ROLES } from '../../utils/constants';

const menuItems = {
  [ROLES.SUPER_ADMIN]: [
    {
      href: '/super-admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      href: '/super-admin/schools',
      label: 'Schools',
      icon: School,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20'
    },
    {
      href: '/super-admin/principals',
      label: 'Principals',
      icon: UserCog,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
  ],
  [ROLES.PRINCIPAL]: [
    {
      href: '/principal/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      href: '/principal/school',
      label: 'School Profile',
      icon: Building2,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20'
    },
    {
      href: '/principal/teachers',
      label: 'Teachers',
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      href: '/principal/students',
      label: 'Students',
      icon: GraduationCap,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20'
    },
    {
      href: '/student/leaderboard',
      label: 'Leaderboard',
      icon: Award,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20'
    },
    {
      href: '/principal/classes',
      label: 'Classes',
      icon: BookOpen,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      href: '/principal/assign',
      label: 'Assignments',
      icon: UserCheck,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20'
    },
    {
      href: '/principal/fees',
      label: 'Fee Management',
      icon: CreditCard,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20'
    },
    {
      href: '/principal/website/pages',
      label: 'Website',
      icon: FileText,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20'
    },
    {
      href: '/principal/website/media',
      label: 'Media Library',
      icon: Image,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/20'
    },
    {
      href: '/principal/notifications',
      label: 'Notifications',
      icon: Bell,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      href: '/principal/monitoring',
      label: 'Silent Control',
      icon: EyeOff,
      color: 'text-slate-500',
      bgColor: 'bg-slate-500/20'
    },
    // {
    //   href: '/principal/settings',
    //   label: 'Settings',
    //   icon: Settings,
    //   color: 'text-gray-400',
    //   bgColor: 'bg-gray-500/20'
    // },
  ],
  [ROLES.TEACHER]: [
    {
      href: '/teacher/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      href: '/student/leaderboard',
      label: 'Leaderboard',
      icon: Award,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20'
    },
    {
      href: '/teacher/classes',
      label: 'My Classes',
      icon: BookOpen,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      href: '/teacher/chat',
      label: 'Class Chat',
      icon: MessageSquare,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      href: '/teacher/attendance',
      label: 'Attendance',
      icon: ClipboardList,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20'
    },
    {
      href: '/teacher/marks',
      label: 'Marks & Grades',
      icon: Award,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20'
    },
    {
      href: '/teacher/schedule',
      label: 'Schedule',
      icon: Calendar,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20'
    },
  ],
  [ROLES.STUDENT]: [
    {
      href: '/student/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      href: '/student/leaderboard',
      label: 'Leaderboard',
      icon: Award,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20'
    },
    {
      href: '/student/chat',
      label: 'Class Chat',
      icon: MessageSquare,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      href: '/student/attendance',
      label: 'Attendance',
      icon: ClipboardList,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20'
    },
    {
      href: '/student/marks',
      label: 'My Grades',
      icon: Award,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20'
    },
    {
      href: '/student/schedule',
      label: 'Schedule',
      icon: Calendar,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20'
    },
    {
      href: '/student/profile',
      label: 'My Profile',
      icon: UserCircle,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20'
    },
  ],
};

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  closed: {
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
};

const menuItemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    }
  },
  hover: {
    scale: 1.02,
    x: 5,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    }
  },
  tap: {
    scale: 0.98,
  }
};


export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);

  // 修复：路由变化时自动关闭侧边栏（移动端）
  useEffect(() => {
  if (window.innerWidth < 1024) {
    setIsOpen(false);
  }
}, [pathname]);


  // 修复：阻止滚动穿透
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!user) return null;

  const items = menuItems[user.role] || [];
  const userRoleLabel = user.role?.toLowerCase().replace('_', ' ');

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
  whileTap={{ scale: 0.95 }}
  onClick={() => setIsOpen(prev => !prev)}
  className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg"
>
  <Menu size={20} />
</motion.button>


      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <motion.aside
          key="sidebar"
          variants={sidebarVariants}
          initial={false}
animate={isOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? "open" : "closed"}
          exit="closed"
          className={cn(
  'fixed top-0 left-0 z-50',
  'h-screen w-72',
  'flex flex-col',
  'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950',
  'border-r border-gray-800',
  'shadow-2xl',
  'lg:static lg:shadow-xl lg:translate-x-0'
)}

        >
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-800 transition-colors z-10"
          >
            <X size={20} className="text-gray-300" />
          </button>

          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  EduManage Pro
                </h2>
                <p className="text-xs text-gray-400">School Management System</p>
              </div>
            </div>

            {/* User Profile */}
            <div className="relative p-4 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
                    <UserCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-gray-900" />
                </div>
                <Link href="/principal/profile" >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{userRoleLabel}</p>
                </div>
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </p>
            {items.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const isHovered = hoveredItem === item.href;

              return (
                <motion.div
                  key={item.href}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.03 }}
                  whileHover="hover"
                  whileTap="tap"
                  onHoverStart={() => setHoveredItem(item.href)}
                  onHoverEnd={() => setHoveredItem(null)}
                >
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setIsOpen(false);
                      }
                    }}
                    className={cn(
                      'relative flex items-center gap-3 px-4 py-3 rounded-xl',
                      'transition-all duration-300',
                      'group',
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-l-4 border-blue-400'
                        : 'hover:bg-gray-800/50'
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r"
                      />
                    )}

                    {/* Icon */}
                    <motion.div
                      animate={isHovered || isActive ? { rotate: [0, -10, 10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                      className={cn(
                        'p-2 rounded-lg transition-all duration-300',
                        isActive
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md'
                          : item.bgColor
                      )}
                    >
                      <Icon className={cn('w-5 h-5', isActive ? 'text-white' : item.color)} />
                    </motion.div>

                    {/* Label */}
                    <span className={cn(
                      'font-medium transition-colors',
                      isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    )}>
                      {item.label}
                    </span>

                    {/* Hover arrow */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        x: isHovered ? 0 : -10
                      }}
                      className="ml-auto"
                    >
                      <ChevronRight className="w-4 h-4 text-blue-400" />
                    </motion.div>

                    {/* Background glow on hover */}
                    <div className={cn(
                      'absolute inset-0 rounded-xl',
                      'bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0',
                      'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                    )} />
                  </Link>
                </motion.div>
              );
            })}

            {/* Help Section */}
            <div className="mt-8 px-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                  <p className="text-sm font-medium text-white">Need Help?</p>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Get assistance with the system
                </p>
                <Link
                  href="/help"
                  onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
                >
                  Visit Help Center
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </nav>

          {/* Footer / Logout */}
          <div className="p-4 border-t border-gray-800">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="relative w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl overflow-hidden group"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

              {/* Content */}
              <div className="relative flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 group-hover:from-red-600 group-hover:to-orange-600 transition-all duration-300">
                  <LogOut className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-300 group-hover:text-white transition-colors">
                  Logout
                </span>
              </div>
            </motion.button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Version 2.0 • © 2024 EduManage
              </p>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>
    </>
  );
}