import winston from "winston";
import path from "path";

const logLevel = process.env.LOG_LEVEL || "info";
const logFile = process.env.LOG_FILE || "logs/app.log";

// Create logs directory if it doesn't exist
import fs from "fs";
const logDir = path.dirname(logFile);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for console logging
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    // Add stack trace if present
    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

// File format (JSON for better parsing)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: logLevel,
  defaultMeta: { service: "rfq-automation-backend" },
  transports: [
    // Console logging
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // File logging
    new winston.transports.File({
      filename: logFile,
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),

    // Error-only file
    new winston.transports.File({
      filename: logFile.replace(".log", ".error.log"),
      level: "error",
      format: fileFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
  ],
});

export default logger;
