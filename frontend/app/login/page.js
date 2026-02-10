'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/src/context/auth.context';
import Link from 'next/link';
import { containerVariants, itemVariants, tapScale } from '@/src/lib/motion';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    const user = JSON.parse(storedUser);
    if (!user?.role) return;
    switch (user.role) {
      case 'SUPER_ADMIN':
        router.replace('/super-admin/dashboard');
        break;
      case 'PRINCIPAL':
        router.replace('/principal/dashboard');
        break;
      case 'TEACHER':
        router.replace('/teacher/dashboard');
        break;
      case 'STUDENT':
        router.replace('/student/dashboard');
        break;
      default:
        router.replace('/unauthorized');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="app-bg-texture min-h-screen flex items-center justify-center px-4 py-8"
      style={{ fontFamily: 'var(--app-body)' }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md rounded-[var(--app-radius-lg)] p-8 shadow-[var(--app-shadow-lg)]"
        style={{
          backgroundColor: 'hsl(var(--app-surface))',
          border: '1px solid hsl(var(--app-border))',
        }}
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-[var(--app-radius)] flex items-center justify-center"
            style={{ backgroundColor: 'hsl(var(--app-accent))' }}
          >
            <LogIn size={30} className="text-white" />
          </div>
          <h1
            className="text-2xl font-bold text-[hsl(var(--app-text))] sm:text-3xl"
            style={{ fontFamily: 'var(--app-display)' }}
          >
            Login
          </h1>
          <p className="text-[hsl(var(--app-text-muted))] mt-2 text-sm">
            Please enter your credentials
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={itemVariants}>
            <label className="block text-[hsl(var(--app-text))] font-medium mb-1 text-sm">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--app-text-muted))]"
              />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-[var(--app-radius-sm)] border border-[hsl(var(--app-border))] bg-[hsl(var(--app-surface))] text-[hsl(var(--app-text))] placeholder:text-[hsl(var(--app-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-accent))] focus:ring-offset-1"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-[hsl(var(--app-text))] font-medium mb-1 text-sm">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--app-text-muted))]"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 rounded-[var(--app-radius-sm)] border border-[hsl(var(--app-border))] bg-[hsl(var(--app-surface))] text-[hsl(var(--app-text))] placeholder:text-[hsl(var(--app-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-accent))] focus:ring-offset-1"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--app-text-muted))] hover:text-[hsl(var(--app-text))] min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[hsl(var(--app-accent))] hover:underline"
            >
              Forgot Password?
            </Link>
          </motion.div>

          {error && (
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 p-3 rounded-[var(--app-radius-sm)] border border-red-200 bg-red-50 text-red-700"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <motion.button
            variants={itemVariants}
            whileTap={loading ? undefined : tapScale}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-[var(--app-radius-sm)] font-semibold flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-[var(--app-shadow)]"
            style={{ backgroundColor: 'hsl(var(--app-accent))' }}
          >
            {loading ? 'Logging in...' : 'Login'}
            {!loading && <LogIn size={18} />}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
