'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Camera,
  Edit2,
  ChevronRight,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/src/context/auth.context';
import { profileService } from '@/src/services/profile.service';
import { OTPInput } from '@/src/components/forms/OTPInput';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';

const RESEND_COOLDOWN = 60;

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
  const [otpType, setOtpType] = useState(null);
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

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

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

      updateUser({
        name: updatedProfile.name,
        profileImage: updatedProfile.profileImage,
      });

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

      if (otpType === 'email') {
        setEmail(result.data?.email || pendingEmail);
        setPendingEmail('');
      } else if (otpType === 'phone') {
        setPhone(result.data?.phone || pendingPhone);
        setPendingPhone('');
      }

      await fetchProfile();

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
          <Loader2 className="text-blue-600 animate-spin" size={48} />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
                <p className="text-blue-100">Manage your personal information and preferences</p>
              </div>
              <div className="hidden md:block">
                <ShieldCheck size={48} className="opacity-25" />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border p-6 sticky top-6">
                <div className="flex flex-col items-center">
                  {/* Profile Picture */}
                  <div className="relative mb-6">
                    <div className="relative">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Profile"
                          className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg">
                          {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}

                      {/* Image Upload Button */}
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
                        className="absolute bottom-2 right-2 bg-white text-blue-600 rounded-full p-3 cursor-pointer hover:bg-blue-50 shadow-lg border"
                      >
                        <Camera size={20} />
                      </label>

                      {/* Remove Image Button */}
                      {profileImage && (
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                          aria-label="Remove image"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile?.name}</h2>

                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <RoleIcon size={18} className="text-blue-500" />
                    <span className="capitalize">
                      {profile?.role?.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>

                  {/* School Info */}
                  {profile?.school && (
                    <div className="bg-blue-50 rounded-xl p-4 w-full mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Building2 size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">School</p>
                          <p className="font-medium text-gray-900">{profile.school.name}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Class Info */}
                  {profile?.class && (
                    <div className="bg-indigo-50 rounded-xl p-4 w-full">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <GraduationCap size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Class & Section</p>
                          <p className="font-medium text-gray-900">
                            {profile.class.name} - {profile.class.section}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Edit Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                {/* Form Header */}
                <div className="border-b px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Edit2 size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Edit Profile</h3>
                      <p className="text-sm text-gray-500">Update your personal details</p>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        Full Name
                      </div>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          Email Address
                        </div>
                      </label>
                      {profile?.isEmailVerified && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <CheckCircle size={12} />
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={otpType === 'email'}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="Enter your email"
                      />
                      {otpType !== 'email' && email !== profile?.email && (
                        <button
                          onClick={() => handleSendOTP('email')}
                          disabled={sendingOTP || !email.trim() || email === profile?.email}
                          className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                        >
                          {sendingOTP ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              Verify
                              <ChevronRight size={16} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-400" />
                          Phone Number
                        </div>
                      </label>
                      {profile?.isPhoneVerified && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <CheckCircle size={12} />
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={otpType === 'phone'}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="Enter your phone number"
                      />
                      {otpType !== 'phone' && phone !== profile?.phone && (
                        <button
                          onClick={() => handleSendOTP('phone')}
                          disabled={sendingOTP || !phone.trim() || phone === profile?.phone}
                          className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                        >
                          {sendingOTP ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              Verify
                              <ChevronRight size={16} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Role Field (Read-only) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Account Role
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profile?.role?.toLowerCase().replace('_', ' ') || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed capitalize"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <ShieldCheck size={18} />
                      </div>
                    </div>
                  </div>

                  {/* OTP Verification Modal */}
                  {otpType && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-white p-3 rounded-xl shadow-sm">
                          <Shield size={24} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 mb-1">
                            Verify your {otpType === 'email' ? 'email' : 'phone number'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Enter the 6-digit code sent to{' '}
                            <strong className="text-blue-700">
                              {otpType === 'email' ? pendingEmail : pendingPhone}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <OTPInput
                          value={otp}
                          onChange={setOtp}
                          onComplete={handleVerifyOTP}
                          disabled={verifyingOTP}
                          error={otpError}
                          className="justify-center"
                        />

                        {otpError && (
                          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                            <AlertCircle size={16} />
                            <span className="text-sm">{otpError}</span>
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleVerifyOTP()}
                            disabled={verifyingOTP || otp.length !== 6}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            {verifyingOTP ? (
                              <span className="flex items-center justify-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                Verifying...
                              </span>
                            ) : (
                              'Confirm Verification'
                            )}
                          </button>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSendOTP(otpType)}
                              disabled={resendTimer > 0 || sendingOTP}
                              className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend'}
                            </button>
                            <button
                              onClick={handleCancelOTP}
                              className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-white text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-6 border-t">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving || otpType !== null}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 shadow-lg"
                      >
                        {saving ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save size={20} />
                            Save Changes
                          </>
                        )}
                      </button>

                      {hasChanges && !saving && (
                        <button
                          onClick={() => {
                            setName(profile?.name || '');
                            setEmail(profile?.email || '');
                            setPhone(profile?.phone || '');
                            handleRemoveImage();
                          }}
                          className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                        >
                          Discard Changes
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => {
                logout();
              }}
              className="relative w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
                  <LogOut className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-600">
                  Logout
                </span>
              </div>
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Version 2.0 • © 2024 EduManage
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}