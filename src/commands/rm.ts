import { lambdaClient } from "../lambda_client";
import logger from "../logger";

/**
 * Deletes a function
 */
export async function rmCommand(name: string): Promise<void> {
  await lambdaClient.deleteFunction({ FunctionName: name }).promise();
  logger.info(`Deleted function: ${name}`);
}
