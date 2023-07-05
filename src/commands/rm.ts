import { DeleteFunctionCommand } from "@aws-sdk/client-lambda";

import { Lemna } from "../lemna";
import { formatJson } from "../util";

/**
 * Deletes a function
 */
export async function removeCommand(client: Lemna, names: string[]): Promise<void> {
  client.logger.info(`Deleting functions: ${formatJson(names)}`);
  await Promise.all(
    names.map((name) =>
      client.lambdaClient.send(new DeleteFunctionCommand({ FunctionName: name })),
    ),
  );
  client.logger.info(`Deleted functions: ${formatJson(names)}`);
}
