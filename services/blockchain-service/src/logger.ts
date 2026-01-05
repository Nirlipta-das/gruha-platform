/**
 * GRUHA Blockchain Service - Logger
 */

import winston from 'winston';
import { serverConfig } from './config';

const { combine, timestamp, printf, colorize, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let meta = '';
  if (Object.keys(metadata).length > 0) {
    meta = '\n' + JSON.stringify(metadata, null, 2);
  }
  return `${timestamp} [${level}]: ${message}${meta}`;
});

export const logger = winston.createLogger({
  level: serverConfig.nodeEnv === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    serverConfig.nodeEnv === 'development'
      ? combine(colorize(), consoleFormat)
      : json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

export default logger;
