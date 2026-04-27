const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf, colorize, errors } = format;

const isDevelopment = process.env.NODE_ENV !== 'production';

// Custom log format: [timestamp] LEVEL: message
const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return stack
    ? `[${ts}] ${level}: ${message}\n${stack}`
    : `[${ts}] ${level}: ${message}`;
});

const logger = createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: isDevelopment
        ? combine(
            colorize({ all: true }),
            errors({ stack: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            logFormat
          )
        : combine(
            errors({ stack: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            logFormat
          ),
    }),
  ],
});

module.exports = logger;
