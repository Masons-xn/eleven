import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file'
var transport = new (DailyRotateFile)({
  filename: 'log/sys/%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '200m',
  maxFiles: '14d'
});
const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  format: winston.format.combine(
    winston.format.label({ label: 'server' }),
    winston.format.simple(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, label, timestamp }) => {
      return `[${label}:${level}] ${message} (${timestamp})`;
    })
  ),
  transports: [new winston.transports.Console(), transport],
});

export default logger;
