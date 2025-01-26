import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize } = winston.format;

const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const transports = [
  new winston.transports.Console({
    format: combine(colorize(), timestamp(), customFormat),
  }),
  new winston.transports.DailyRotateFile({
    dirname: 'logs/errors',
    filename: '%DATE%.error.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
    format: combine(timestamp(), customFormat),
  }),

  new winston.transports.DailyRotateFile({
    dirname: 'logs/combined',
    filename: '%DATE%.combined.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: combine(timestamp(), customFormat),
  }),
];

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: combine(timestamp(), customFormat),
  transports: transports,
});
