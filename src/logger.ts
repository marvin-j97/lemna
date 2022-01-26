import { createLogger } from "skriva";
import { createConsoleTransport } from "skriva-transport-console";
import chalk, { Chalk } from "chalk";
import { formatJson } from "./util";

const logLevels = {
  error: 0,
  warn: 10,
  info: 20,
  verbose: 30,
  debug: 40,
  silly: 50,
};

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
  level: "debug",
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
