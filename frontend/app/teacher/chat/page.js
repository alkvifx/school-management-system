// TeacherChatPage.js
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { teacherService } from '@/src/services/teacher.service';
import ChatLayout from '@/src/components/chat/ChatLayout';
import { toast } from 'sonner';
import { Loader2, MessageSquare, Sparkles, Shield, Zap, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TeacherChatPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getClasses();
      setClasses(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8"
        >
          {/* Mobile Header */}
          <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 mb-4">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                  className="lg:hidden"
                >
                  {showMobileSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Class Chat</h1>
                  <p className="text-sm text-gray-600">Connect with students</p>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white">
                <Zap className="h-3 w-3 mr-1" />
                {classes.length}
              </Badge>
            </div>
          </div>

          {/* Hero Header - Desktop */}
          <div className="hidden lg:block relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 lg:p-8 text-white shadow-2xl mb-8">
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                      <MessageSquare className="h-8 w-8" />
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Class Communication</span>
                    </div>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                    Class Chat
                    <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Connect with Students
                    </span>
                  </h1>

                  <p className="text-blue-100 text-lg lg:text-xl">
                    Real-time messaging with your classes and students
                  </p>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      <Zap className="h-3 w-3 mr-1" />
                      Real-time
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Secure
                    </Badge>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-blue-200">Active Classes</p>
                        <p className="text-2xl font-bold">{classes.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-24 -translate-x-24" />
          </div>

          {/* Mobile Sidebar Overlay */}
          {showMobileSidebar && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSidebar(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Classes</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowMobileSidebar(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <ChatLayout
                    classes={classes}
                    loading={loading}
                    mobileSidebarOpen={showMobileSidebar}
                    onCloseMobileSidebar={() => setShowMobileSidebar(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Chat Layout */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center min-h-[60vh] lg:min-h-[70vh]"
            >
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading your classes...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="h-[100dvh] min-h-0 lg:h-[calc(100vh-12rem)] flex flex-col"
            >
              <ChatLayout
                classes={classes}
                loading={loading}
                mobileSidebarOpen={showMobileSidebar}
                onCloseMobileSidebar={() => setShowMobileSidebar(false)}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}