'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '@/src/services/auth.service';
import { toast } from 'sonner';
import Link from 'next/link';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      await authService.forgotPassword(email);
      
      // Store email in sessionStorage for reset password page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('resetPasswordEmail', email);
      }
      
      setSuccess(true);
      toast.success('OTP sent to your email');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/reset-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 flex items-center justify-center px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center">
            {success ? (
              <CheckCircle size={30} className="text-white" />
            ) : (
              <Mail size={30} className="text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {success ? 'Check Your Email' : 'Forgot Password'}
          </h1>
          <p className="text-gray-600">
            {success
              ? 'We sent a password reset code to your email'
              : 'Enter your email to receive a password reset code'}
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-900 outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg"
              >
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Code
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-blue-900 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                We've sent a 6-digit verification code to{' '}
                <span className="font-semibold">{email}</span>. Please check your
                inbox and spam folder.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              className="w-full py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              Continue to Reset Password
              <ArrowRight size={18} />
            </motion.button>

            <div className="text-center">
              <button
                onClick={() => setSuccess(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Use a different email
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
