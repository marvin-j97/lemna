import { GetFunctionCommand, type GetFunctionResponse } from "@aws-sdk/client-lambda";

import { Lemna } from "../lemna";

/**
 * Get a function's information
 *
 * @param {Lemna} client Lemna client
 * @param {string} name Function name
 *
 * @returns {GetFunctionResponse} Function response
 */
export async function getFunctionCommand(
  client: Lemna,
  name: string,
): Promise<GetFunctionResponse> {
  return client.lambdaClient.send(new GetFunctionCommand({ FunctionName: name }));
}
