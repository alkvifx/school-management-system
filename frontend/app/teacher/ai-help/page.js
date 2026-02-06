'use client';

import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import AiChatBox from '@/src/components/ai/AiChatBox';
import { motion } from 'framer-motion';

export default function TeacherAiHelpPage() {
  return (
    <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">AI Teaching Assistant</h1>
          <p className="text-gray-600">Ask for teaching support 🧠 — Lesson planning, explanations, and content.</p>
        </div>
        <AiChatBox
          role="TEACHER"
          greeting="Ask for teaching support 🧠"
          emptyMessage="Your AI teaching assistant is ready 🚀 Ask anything about lesson planning, explanations, or content creation."
        />
      </motion.div>
    </ProtectedRoute>
  );
}
