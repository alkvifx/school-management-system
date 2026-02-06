'use client';

import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import AiChatBox from '@/src/components/ai/AiChatBox';
import { motion } from 'framer-motion';

export default function StudentAiHelpPage() {
  return (
    <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">AI Doubt Solver</h1>
          <p className="text-gray-600">Ask your doubts 📚 — Get clear explanations and examples.</p>
        </div>
        <AiChatBox
          role="STUDENT"
          greeting="Ask your doubts 📚"
          emptyMessage="Your AI doubt solver is ready 🚀 Ask anything about your studies."
        />
      </motion.div>
    </ProtectedRoute>
  );
}
