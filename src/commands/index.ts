import { checkAWSKeys } from "../creds";
import { Lemna } from "../lemna";
import { createLemnaLogger, type LogLevel, logLevels } from "../logger";

export interface ICommandOptions {
  requiresCredentials: boolean;
}

/**
 * Command wrapper
 */
export async function runCommand(
  fn: (client: Lemna) => Promise<void>,
  runOptions: ICommandOptions,
): Promise<void> {
  const logLevel = process.env.LEMNA_LOG_LEVEL;
  if (logLevel && !(logLevel in logLevels)) {
    console.error(`Invalid log level: ${logLevel}`);
    process.exit(1);
  }

  const logger = createLemnaLogger((process.env.LEMNA_LOG_LEVEL as LogLevel) ?? "info");

  if (runOptions.requiresCredentials) {
    checkAWSKeys(logger);
  }

  const client = new Lemna(logger);

  try {
    await fn(client);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    client.logger.error(`Error during operation: ${error.message}`);
    client.logger.silly(error.stack);
    process.exit(1);
  }
}
