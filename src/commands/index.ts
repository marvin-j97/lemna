import { checkAWSKeys } from "../creds";
import logger from "../logger";
import { registerModules } from "../register";

export interface ICommandOptions {
  modulesToRegister: string[];
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
  registerModules(runOptions.modulesToRegister);

  try {
    await fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(`Error during operation: ${error.message}`);
    logger.silly(error.stack);
  }
}
