/**
 * GRUHA API Gateway Logger
 * Per PRD requirements for audit logging
 */

import winston from 'winston';
import { config } from './config';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [API-GATEWAY] ${level.toUpperCase()}: ${message}${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
  ],
});

// Request logging helper
export function logRequest(requestId: string, method: string, path: string, userId?: string) {
  logger.info(`Request: ${method} ${path}`, { requestId, userId });
}

// Response logging helper
export function logResponse(requestId: string, statusCode: number, duration: number) {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  logger[level](`Response: ${statusCode}`, { requestId, duration: `${duration}ms` });
}

// Auth event logging
export function logAuthEvent(event: string, userId: string, success: boolean, meta?: object) {
  const level = success ? 'info' : 'warn';
  logger[level](`Auth: ${event}`, { userId, success, ...meta });
}
