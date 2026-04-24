import * as winston from 'winston';
import 'winston-daily-rotate-file';

export const getWinstonConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const logLevel = process.env.LOG_LEVEL || 'log';
  const maxFileSize = `${process.env.LOG_MAX_FILE_SIZE || 1024}k`;

  const consoleFormat = isProduction
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.simple(),
      );

  return {
    level: logLevel === 'log' ? 'info' : logLevel,
    transports: [
      new winston.transports.Console({
        format: consoleFormat,
      }),

      new winston.transports.DailyRotateFile({
        filename: 'logs/app-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH-mm-ss',
        maxSize: maxFileSize,
        zippedArchive: false,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
  };
};
