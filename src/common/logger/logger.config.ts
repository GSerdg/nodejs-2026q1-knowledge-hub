import * as winston from 'winston';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const getWinstonConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const logLevel = process.env.LOG_LEVEL || 'log';
  const maxFileSize =
    Number.parseInt(process.env.LOG_MAX_FILE_SIZE || '1024') * 1024;
  const logsDir = path.join(process.cwd(), 'logs');

  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

  const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, context, stack }) => {
      const ctx = context ? ` [${context}]` : '';
      const s = stack ? `\n${stack}` : '';
      return `${timestamp} ${level}:${ctx} ${message}${s}`;
    }),
  );

  const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  );

  const fileTransport = new winston.transports.File({
    dirname: 'logs',
    filename: 'app.log',
    maxsize: maxFileSize,
    maxFiles: 5,
    tailable: true,
    format: fileFormat,
  });

  fileTransport.on('logged', () => {
    const rotatedFile = path.join(logsDir, 'app1.log');
    if (fs.existsSync(rotatedFile)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const newName = path.join(logsDir, `app-${timestamp}.log`);
      try {
        fs.renameSync(rotatedFile, newName);
      } catch (e) {}
    }
  });

  return {
    level: logLevel === 'log' ? 'info' : logLevel,
    transports: [
      new winston.transports.Console({
        format: isProduction ? winston.format.json() : consoleFormat,
      }),
      fileTransport,
    ],
  };
};
