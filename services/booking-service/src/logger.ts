/**
 * GRUHA Booking Service - Logger
 */

import winston from 'winston';
import { config } from './config';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  config.nodeEnv === 'development'
    ? winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    : winston.format.json()
);

export const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
  ],
});
