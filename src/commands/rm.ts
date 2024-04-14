import { DeleteFunctionCommand } from "@aws-sdk/client-lambda";

import type { Lemna } from "../lemna";
import { formatJson } from "../util";

/**
 * Deletes a function
 *
 * @param {Lemna} client Lemna client
 * @param {string[]} names Function names
 */
export async function removeCommand(client: Lemna, names: string[]): Promise<void> {
  client.logger.warn(`Deleting functions: ${formatJson(names)}`);

  const result = await Promise.allSettled(
    names.map(async (name) => {
      await client.lambdaClient.send(new DeleteFunctionCommand({ FunctionName: name }));
      return name;
    }),
  );

  const deletedNames = result
    .filter((x) => x.status === "fulfilled")
    .map((x) => (x as PromiseFulfilledResult<string>).value);

  if (deletedNames.length > 0) {
    client.logger.info("Deleted functions:");
    for (const name of deletedNames) {
      client.logger.info(`- ${name}`);
    }
  }

  const errors = result
    .filter((x) => x.status === "rejected")
    .map((x) => (x as PromiseRejectedResult).reason);

  if (errors.length > 0) {
    client.logger.info("Errors during deletion:");
    for (const reason of errors) {
      client.logger.error(`- ${reason}`);
    }
  }
}
