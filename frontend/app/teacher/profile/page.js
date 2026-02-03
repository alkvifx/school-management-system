'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Save,
  Upload,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
  Building2,
  GraduationCap,
  UserCog,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/src/context/auth.context';
import { profileService } from '@/src/services/profile.service';
import { OTPInput } from '@/src/components/forms/OTPInput';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';

const RESEND_COOLDOWN = 60; // 60 seconds

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // OTP state
  const [otpType, setOtpType] = useState(null); // 'email' | 'phone' | null
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [otpError, setOtpError] = useState('');

  const fileInputRef = useRef(null);

  // Check if form has changes
  const hasChanges =
    name !== (profile?.name || '') ||
    profileImage !== null ||
    email !== (profile?.email || '') ||
    phone !== (profile?.phone || '');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setName(data.name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setProfileImagePreview(data.profileImage?.url || null);
    } catch (error) {
      toast.error(error.message || 'Failed to load profile');
      if (error.message?.includes('401') || error.message?.includes('token')) {
        logout();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImagePreview(profile?.profileImage?.url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    try {
      setSaving(true);
      const updateData = {};

      if (name !== (profile?.name || '')) {
        updateData.name = name;
      }

      if (profileImage) {
        updateData.profileImage = profileImage;
      }

      const updatedProfile = await profileService.updateProfile(updateData);

      // Update auth context
      updateUser({
        name: updatedProfile.name,
        profileImage: updatedProfile.profileImage,
      });

      // Refresh profile
      await fetchProfile();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      if (error.message?.includes('401') || error.message?.includes('token')) {
        logout();
        router.push('/login');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSendOTP = async (type) => {
    if (type === 'email') {
      const newEmail = email.trim();
      if (!newEmail || newEmail === profile?.email) {
        toast.error('Please enter a different email address');
        return;
      }
      setPendingEmail(newEmail);
    } else if (type === 'phone') {
      const newPhone = phone.trim();
      if (!newPhone || newPhone === profile?.phone) {
        toast.error('Please enter a different phone number');
        return;
      }
      setPendingPhone(newPhone);
    }

    try {
      setSendingOTP(true);
      setOtpError('');
      const result = await profileService.sendOTP(
        type,
        type === 'email' ? email : null,
        type === 'phone' ? phone : null
      );

      setOtpType(type);
      setOtp('');
      setResendTimer(RESEND_COOLDOWN);

      // In development, show OTP if provided
      if (result.data?.otp) {
        toast.success(`OTP sent! (Dev: ${result.data.otp})`);
      } else {
        toast.success(result.message || 'OTP sent successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
      setOtpType(null);
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (otpValue = null) => {
    const otpToVerify = otpValue || otp;

    if (!otpToVerify || otpToVerify.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setVerifyingOTP(true);
      setOtpError('');
      const result = await profileService.verifyOTP(otpType, otpToVerify);

      toast.success(result.message || 'Verification successful');

      // Update local state
      if (otpType === 'email') {
        setEmail(result.data?.email || pendingEmail);
        setPendingEmail('');
      } else if (otpType === 'phone') {
        setPhone(result.data?.phone || pendingPhone);
        setPendingPhone('');
      }

      // Refresh profile
      await fetchProfile();

      // Reset OTP state
      setOtpType(null);
      setOtp('');
    } catch (error) {
      setOtpError(error.message || 'OTP verification failed');
      setOtp('');
    } finally {
      setVerifyingOTP(false);
    }
  };

  const handleCancelOTP = () => {
    setOtpType(null);
    setOtp('');
    setOtpError('');
    setPendingEmail('');
    setPendingPhone('');
    if (otpType === 'email') {
      setEmail(profile?.email || '');
    } else if (otpType === 'phone') {
      setPhone(profile?.phone || '');
    }
  };

  const getRoleIcon = () => {
    switch (profile?.role) {
      case ROLES.PRINCIPAL:
        return UserCog;
      case ROLES.TEACHER:
        return UserCog;
      case ROLES.STUDENT:
        return GraduationCap;
      default:
        return User;
    }
  };

  const RoleIcon = getRoleIcon();

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </ProtectedRoute>
    );
  }

  console.log('authUser:', authUser);


  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your profile information</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                {profileImagePreview ? (
                  <div className="relative">
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                    />
                    {profileImage && (
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-100">
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="profile-image-input"
                />
                <label
                  htmlFor="profile-image-input"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Upload size={16} />
                </label>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile?.name}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 mb-2">
                  <RoleIcon size={18} />
                  <span className="capitalize">
                    {profile?.role?.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                {profile?.school && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 text-sm">
                    <Building2 size={16} />
                    <span>{profile.school.name}</span>
                  </div>
                )}
                {profile?.class && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 text-sm mt-1">
                    <GraduationCap size={16} />
                    <span>
                      {profile.class.name} - {profile.class.section}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 pt-6 border-t">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>Email Address</span>
                    {profile?.isEmailVerified && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Verified
                      </span>
                    )}
                  </div>
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpType === 'email'}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your email"
                  />
                  {otpType !== 'email' && email !== profile?.email && (
                    <button
                      onClick={() => handleSendOTP('email')}
                      disabled={sendingOTP || !email.trim() || email === profile?.email}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sendingOTP ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
                    </button>
                  )}
                </div>
                {otpType === 'email' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Verify your new email address
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      We've sent a verification code to <strong>{pendingEmail}</strong>
                    </p>
                    <OTPInput
                      value={otp}
                      onChange={setOtp}
                      onComplete={handleVerifyOTP}
                      disabled={verifyingOTP}
                      error={otpError}
                    />
                    {otpError && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {otpError}
                      </p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleVerifyOTP()}
                        disabled={verifyingOTP || otp.length !== 6}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {verifyingOTP ? (
                          <>
                            <Loader2 size={16} className="animate-spin inline mr-2" />
                            Verifying...
                          </>
                        ) : (
                          'Verify'
                        )}
                      </button>
                      <button
                        onClick={() => handleSendOTP('email')}
                        disabled={resendTimer > 0 || sendingOTP}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend'}
                      </button>
                      <button
                        onClick={handleCancelOTP}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>Phone Number</span>
                    {profile?.isPhoneVerified && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Verified
                      </span>
                    )}
                  </div>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={otpType === 'phone'}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your phone number"
                  />
                  {otpType !== 'phone' && phone !== profile?.phone && (
                    <button
                      onClick={() => handleSendOTP('phone')}
                      disabled={sendingOTP || !phone.trim() || phone === profile?.phone}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sendingOTP ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
                    </button>
                  )}
                </div>
                {otpType === 'phone' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Verify your new phone number
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Enter the verification code sent to <strong>{pendingPhone}</strong>
                    </p>
                    <OTPInput
                      value={otp}
                      onChange={setOtp}
                      onComplete={handleVerifyOTP}
                      disabled={verifyingOTP}
                      error={otpError}
                    />
                    {otpError && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {otpError}
                      </p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleVerifyOTP()}
                        disabled={verifyingOTP || otp.length !== 6}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {verifyingOTP ? (
                          <>
                            <Loader2 size={16} className="animate-spin inline mr-2" />
                            Verifying...
                          </>
                        ) : (
                          'Verify'
                        )}
                      </button>
                      <button
                        onClick={() => handleSendOTP('phone')}
                        disabled={resendTimer > 0 || sendingOTP}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend'}
                      </button>
                      <button
                        onClick={handleCancelOTP}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Role (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={profile?.role?.toLowerCase().replace('_', ' ') || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed capitalize"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t">
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving || otpType !== null}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-800">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  logout();
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
                                  <span className="font-medium text-gray-600 group-hover:text-black transition-colors">
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
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
