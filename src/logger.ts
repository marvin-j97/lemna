import winston from "winston";
const { printf, combine, colorize, timestamp } = winston.format;

const formatter = printf(({ level, message, timestamp }) => {
  return `${timestamp} [lemna] ${level}: ${message}`;
});

export const logger = winston.createLogger({
  level: process.env.LEMNA_LOG_LEVEL || "info",
  format: combine(timestamp(), colorize(), formatter),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["silly", "debug", "verbose", "info", "warn", "error"],
    }),
  ],
});
