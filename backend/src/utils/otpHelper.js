import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Generate a secure 6-digit numeric OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  // Generate random number between 100000 and 999999
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP using bcrypt before storing in database
 * @param {string} otp - Plain text OTP
 * @returns {Promise<string>} Hashed OTP
 */
export const hashOTP = async (otp) => {
  const saltRounds = 10;
  return await bcrypt.hash(otp, saltRounds);
};

/**
 * Compare plain OTP with hashed OTP
 * @param {string} plainOTP - Plain text OTP from user
 * @param {string} hashedOTP - Hashed OTP from database
 * @returns {Promise<boolean>} True if OTP matches
 */
export const compareOTP = async (plainOTP, hashedOTP) => {
  if (!plainOTP || !hashedOTP) {
    return false;
  }
  return await bcrypt.compare(plainOTP, hashedOTP);
};

/**
 * Check if OTP has expired
 * @param {Date} expiresAt - Expiration date
 * @returns {boolean} True if expired
 */
export const isOTPExpired = (expiresAt) => {
  if (!expiresAt) {
    return true;
  }
  return new Date() > new Date(expiresAt);
};

/**
 * Generate OTP expiration date (10 minutes from now)
 * @returns {Date} Expiration date
 */
export const getOTPExpiration = () => {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 10);
  return expirationTime;
};
