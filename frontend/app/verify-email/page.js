'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { authService } from '@/src/services/auth.service';
import { OTPInput } from '@/src/components/forms/OTPInput';
import Link from 'next/link';
import { toast } from 'sonner';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const RESEND_COOLDOWN = 60; // 60 seconds

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    // Get email from sessionStorage
    if (typeof window !== 'undefined') {
      const pendingEmail = sessionStorage.getItem('pendingVerificationEmail');
      if (pendingEmail) {
        setEmail(pendingEmail);
      } else {
        // If no email in session, redirect to login
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    // Start resend timer if needed
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async (otpValue = null) => {
    const otpToVerify = otpValue || otp;
    
    if (!otpToVerify || otpToVerify.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verifyEmailOTP(email, otpToVerify);
      setSuccess(true);
      toast.success('Email verified successfully!');
      
      // Clear session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pendingVerificationEmail');
      }

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
      setOtp(''); // Clear OTP on error
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    setError('');

    try {
      await authService.resendEmailOTP(email);
      setResendTimer(RESEND_COOLDOWN);
      toast.success('OTP sent to your email');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOTPComplete = (otpValue) => {
    setOtp(otpValue);
    handleVerify(otpValue);
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
            {success ? 'Email Verified!' : 'Verify Your Email'}
          </h1>
          <p className="text-gray-600">
            {success
              ? 'Your email has been verified successfully.'
              : 'We sent a 6-digit code to your email address'}
          </p>
        </div>

        {!success ? (
          <>
            {/* Email Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Email Address</p>
              <p className="text-base font-semibold text-gray-900">{email}</p>
            </div>

            {/* OTP Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter Verification Code
              </label>
              <OTPInput
                value={otp}
                onChange={setOtp}
                onComplete={handleOTPComplete}
                disabled={loading}
                error={!!error}
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-4"
              >
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Verify Button */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              onClick={() => handleVerify()}
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </motion.button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || resendLoading}
                className="text-sm font-medium text-blue-900 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Sending...
                  </span>
                ) : resendTimer > 0 ? (
                  `Resend OTP in ${resendTimer}s`
                ) : (
                  'Resend OTP'
                )}
              </button>
            </div>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle size={40} className="text-green-600" />
            </motion.div>
            <p className="text-gray-600 mb-6">
              Redirecting to login page...
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-900 hover:underline"
            >
              Go to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
