import type { GetFunctionResponse } from "aws-sdk/clients/lambda";

import { lambdaClient } from "../lambda_client";

/**
 * Get a function's information
 */
export async function readFunctionDetails(name: string): Promise<GetFunctionResponse> {
  const func = await lambdaClient.getFunction({ FunctionName: name }).promise();
  return func;
}
