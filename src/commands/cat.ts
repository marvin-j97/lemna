import { lambdaClient } from "../lambda_client";
import { formatJson } from "../util";

/**
 * Print a function's information
 */
export async function catCommand(name: string): Promise<void> {
  const func = await lambdaClient.getFunction({ FunctionName: name }).promise();
  console.log(formatJson(func));
}
