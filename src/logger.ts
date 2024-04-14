import chalk, { type ChalkInstance } from "chalk";
import { type LogFunction, createLogger } from "skriva";
import { createConsoleTransport } from "skriva-transport-console";

import { formatJson } from "./util";

export const logLevels = {
  error: 0,
  warn: 10,
  info: 20,
  verbose: 30,
  debug: 40,
  silly: 50,
};

export type LogLevel = keyof typeof logLevels;

const colorize: Record<keyof typeof logLevels, ChalkInstance> = {
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.green,
  verbose: chalk.hex("#6969b3"),
  debug: chalk.magentaBright,
  silly: chalk.blueBright,
};

/**
 * Creates a logger instance
 */
export function createLemnaLogger(level: LogLevel): Record<LogLevel, LogFunction<unknown>> {
  return createLogger<unknown, typeof logLevels, { timestamp: Date }>({
    context: () => ({ timestamp: new Date() }),
    logLevels,
    level,
    transports: [
      {
        handler: createConsoleTransport({
          format: ({ timestamp, level, message }) => {
            if (message instanceof Error) {
              return `${chalk.grey(timestamp.toISOString())} ${colorize[level](level)} ${
                message.message
              }`;
            }
            if (typeof message === "string") {
              return `${chalk.grey(timestamp.toISOString())} ${colorize[level](level)} ${message}`;
            }
            return `${chalk.grey(timestamp.toISOString())} ${colorize[level](level)} ${formatJson(
              message,
            )}`;
          },
        }),
      },
    ],
  });
}

export type Logger = Record<LogLevel, LogFunction<unknown>>;
