'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { studentService } from '@/src/services/student.service';
import ChatLayout from '@/src/components/chat/ChatLayout';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function StudentChatPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClass();
  }, []);

  const fetchClass = async () => {
    try {
      setLoading(true);
      // Get student profile which includes class information
      const profile = await studentService.getProfile();
      
      // Extract class information from profile
      if (profile.classId || profile.class) {
        const classData = {
          _id: profile.classId || profile.class?._id || profile.class?.id,
          id: profile.classId || profile.class?._id || profile.class?.id,
          name: profile.className || profile.class?.name,
          grade: profile.class?.grade,
          section: profile.class?.section || profile.classSection,
        };
        setClasses([classData]);
      } else {
        setClasses([]);
        toast.error('No class assigned');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch class information');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-4 lg:mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Class Chat</h1>
          <p className="text-gray-600 text-sm mt-1">Chat with your class</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[60vh] lg:h-96">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="h-[100dvh] min-h-0 lg:h-[calc(100vh-10rem)] flex flex-col -mx-4 lg:mx-0">
            <ChatLayout
              classes={classes}
              loading={loading}
              mobileSidebarOpen={false}
              onCloseMobileSidebar={() => {}}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
