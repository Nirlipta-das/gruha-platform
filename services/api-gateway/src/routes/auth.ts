/**
 * GRUHA Authentication Routes
 * Per PRD §9 - POST /auth/otp/send → POST /auth/otp/verify
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { sendOtp, verifyOtp } from '../otp-service';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  revokeRefreshTokens 
} from '../jwt-service';
import { authMiddleware } from '../middleware';
import { UserRole } from '../config';
import { logger, logAuthEvent } from '../logger';

const router = Router();

// In-memory user store (use database in production)
interface UserRecord {
  id: string;
  phone: string;
  role: UserRole;
  walletAddress?: string;
  createdAt: Date;
}

const users = new Map<string, UserRecord>();
const phoneToUserId = new Map<string, string>();

// Helper to create user ID
function createUserId(): string {
  return `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * POST /auth/otp/send
 * Send OTP to phone number
 */
router.post(
  '/otp/send',
  [
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone number must be 10 digits'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: errors.array(),
          },
        });
      }

      const { phone } = req.body;
      
      const result = await sendOtp(phone);
      
      logAuthEvent('OTP_SENT', phone, true);
      
      res.json({
        success: true,
        data: {
          sessionId: result.sessionId,
          expiresIn: result.expiresIn,
          message: 'OTP sent successfully',
        },
      });
    } catch (error) {
      logger.error('Failed to send OTP', { error });
      res.status(500).json({
        error: {
          code: 'OTP_SEND_FAILED',
          message: 'Failed to send OTP',
        },
      });
    }
  }
);

/**
 * POST /auth/otp/verify
 * Verify OTP and return tokens
 */
router.post(
  '/otp/verify',
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('otp')
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits'),
    body('role')
      .optional()
      .isIn(Object.values(UserRole))
      .withMessage('Invalid role'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: errors.array(),
          },
        });
      }

      const { sessionId, otp, role = UserRole.MSME } = req.body;
      
      const result = await verifyOtp(sessionId, otp);
      
      if (!result.success) {
        logAuthEvent('OTP_VERIFY', sessionId, false, { error: result.error });
        return res.status(400).json({
          error: {
            code: 'OTP_VERIFICATION_FAILED',
            message: result.error,
          },
        });
      }

      const phone = result.phone!;
      
      // Get or create user
      let userId = phoneToUserId.get(phone);
      let isNewUser = false;
      
      if (!userId) {
        userId = createUserId();
        const user: UserRecord = {
          id: userId,
          phone,
          role,
          createdAt: new Date(),
        };
        users.set(userId, user);
        phoneToUserId.set(phone, userId);
        isNewUser = true;
        logger.info(`New user registered: ${userId}`);
      }
      
      const user = users.get(userId)!;
      
      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        phone: user.phone,
        role: user.role,
        walletAddress: user.walletAddress,
      });
      
      const refreshToken = generateRefreshToken(user.id);
      
      logAuthEvent('LOGIN', userId, true, { isNewUser });
      
      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            phone: user.phone,
            role: user.role,
            isNewUser,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to verify OTP', { error });
      res.status(500).json({
        error: {
          code: 'VERIFICATION_FAILED',
          message: 'Failed to verify OTP',
        },
      });
    }
  }
);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: errors.array(),
          },
        });
      }

      const { refreshToken } = req.body;
      
      const payload = verifyRefreshToken(refreshToken);
      
      if (!payload) {
        return res.status(401).json({
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token',
          },
        });
      }

      const user = users.get(payload.userId);
      
      if (!user) {
        return res.status(401).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken({
        userId: user.id,
        phone: user.phone,
        role: user.role,
        walletAddress: user.walletAddress,
      });
      
      const newRefreshToken = generateRefreshToken(user.id);
      
      logAuthEvent('TOKEN_REFRESH', user.id, true);
      
      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      logger.error('Failed to refresh token', { error });
      res.status(500).json({
        error: {
          code: 'REFRESH_FAILED',
          message: 'Failed to refresh token',
        },
      });
    }
  }
);

/**
 * POST /auth/logout
 * Logout and revoke refresh tokens
 */
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    revokeRefreshTokens(userId);
    
    logAuthEvent('LOGOUT', userId, true);
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Failed to logout', { error });
    res.status(500).json({
      error: {
        code: 'LOGOUT_FAILED',
        message: 'Failed to logout',
      },
    });
  }
});

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = users.get(userId);
    
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Failed to get user info', { error });
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to get user info',
      },
    });
  }
});

// Export users map for use by other services
export { users, phoneToUserId };
export default router;
