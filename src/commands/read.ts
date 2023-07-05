import { GetFunctionCommand, GetFunctionResponse } from "@aws-sdk/client-lambda";

import { Lemna } from "../lemna";

/**
 * Get a function's information
 */
export async function getFunctionCommand(
  client: Lemna,
  name: string,
): Promise<GetFunctionResponse> {
  return client.lambdaClient.send(new GetFunctionCommand({ FunctionName: name }));
}
