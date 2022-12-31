import { checkAWSKeys } from "../creds";
import logger from "../logger";

export interface ICommandOptions {
  requiresCredentials: boolean;
}

/**
 * Command wrapper
 *
 * Registers node modules if needed and checks AWS credentials
 */
export async function runCommand(
  fn: () => Promise<void>,
  runOptions: ICommandOptions,
): Promise<void> {
  if (runOptions.requiresCredentials) {
    checkAWSKeys();
  }

  try {
    await fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(`Error during operation: ${error.message}`);
    logger.silly(error.stack);
  }
}
