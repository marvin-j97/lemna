import chalk, { Chalk } from "chalk";
import { createLogger } from "skriva";
import { createConsoleTransport } from "skriva-transport-console";

import { formatJson } from "./util";

const logLevels = {
  error: 0,
  warn: 10,
  info: 20,
  verbose: 30,
  debug: 40,
  silly: 50,
};

const logLevel = process.env.LEMNA_LOG_LEVEL;
if (logLevel && !(logLevel in logLevels)) {
  console.error(`Invalid log level: ${logLevel}`);
  process.exit(1);
}

const colorize: Record<keyof typeof logLevels, Chalk> = {
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.green,
  verbose: chalk.hex("#6969b3"),
  debug: chalk.magentaBright,
  silly: chalk.blueBright,
};

const logger = createLogger<unknown, typeof logLevels, { timestamp: Date }>({
  context: () => ({ timestamp: new Date() }),
  logLevels,
  level: <keyof typeof logLevels>logLevel || "info",
  transports: [
    {
      handler: createConsoleTransport({
        format: ({ timestamp, level, message }) => {
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

export default logger;
