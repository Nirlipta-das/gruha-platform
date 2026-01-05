/**
 * GRUHA OTP Service
 * Per PRD §9 - OTP-based authentication
 * 
 * In production: Integrate with SMS gateway (AWS SNS, Twilio, etc.)
 * Development: Uses mock OTP for testing
 */

import { v4 as uuidv4 } from 'uuid';
import { config } from './config';
import { logger } from './logger';

interface OtpRecord {
  otp: string;
  phone: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, OtpRecord>();

/**
 * Generate a random 6-digit OTP
 */
function generateOtp(): string {
  // In development mode, always use mock OTP for testing
  if (config.nodeEnv === 'development') {
    return '123456';
  }
  if (config.otp.mockOtp) {
    return config.otp.mockOtp;
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to phone number
 * Returns session ID for verification
 */
export async function sendOtp(phone: string): Promise<{ sessionId: string; expiresIn: number }> {
  // Clean phone number
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Generate OTP
  const otp = generateOtp();
  const sessionId = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.otp.expiresInMinutes * 60 * 1000);
  
  // Store OTP
  otpStore.set(sessionId, {
    otp,
    phone: cleanPhone,
    createdAt: now,
    expiresAt,
    attempts: 0,
    verified: false,
  });
  
  // In production, send SMS here
  // await sendSms(cleanPhone, `Your GRUHA verification code is: ${otp}`);
  
  logger.info(`OTP sent to ${cleanPhone.slice(-4).padStart(cleanPhone.length, '*')}`, {
    sessionId,
    expiresIn: config.otp.expiresInMinutes * 60,
  });
  
  // In development, log the OTP
  if (config.nodeEnv === 'development') {
    logger.debug(`[DEV] OTP for ${cleanPhone}: ${otp}`);
  }
  
  return {
    sessionId,
    expiresIn: config.otp.expiresInMinutes * 60,
  };
}

/**
 * Verify OTP
 */
export async function verifyOtp(
  sessionId: string,
  otp: string
): Promise<{ success: boolean; phone?: string; error?: string }> {
  const record = otpStore.get(sessionId);
  
  if (!record) {
    return { success: false, error: 'Invalid session' };
  }
  
  // Check expiry
  if (new Date() > record.expiresAt) {
    otpStore.delete(sessionId);
    return { success: false, error: 'OTP expired' };
  }
  
  // Check attempts
  if (record.attempts >= config.otp.maxAttempts) {
    otpStore.delete(sessionId);
    return { success: false, error: 'Maximum attempts exceeded' };
  }
  
  // Increment attempts
  record.attempts++;
  
  // Verify OTP
  if (record.otp !== otp) {
    logger.warn(`Invalid OTP attempt for session ${sessionId}`, { attempts: record.attempts });
    return { 
      success: false, 
      error: `Invalid OTP. ${config.otp.maxAttempts - record.attempts} attempts remaining` 
    };
  }
  
  // Mark as verified
  record.verified = true;
  const phone = record.phone;
  
  // Clean up
  otpStore.delete(sessionId);
  
  logger.info(`OTP verified for ${phone.slice(-4).padStart(phone.length, '*')}`);
  
  return { success: true, phone };
}

/**
 * Clean up expired OTPs (call periodically)
 */
export function cleanupExpiredOtps(): void {
  const now = new Date();
  let cleaned = 0;
  
  for (const [sessionId, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(sessionId);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    logger.debug(`Cleaned up ${cleaned} expired OTP records`);
  }
}

// Clean up every minute
setInterval(cleanupExpiredOtps, 60 * 1000);
