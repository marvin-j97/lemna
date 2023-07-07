import { deployWithConfigPath } from "../deploy";
import { Lemna } from "../lemna";
import { fileVisitor, formatJson } from "../util";

/**
 * Deploy command
 *
 * @param {Lemna} client Lemna client
 * @param {string[]} paths Glob patterns of config files
 */
export async function deployCommand(
  client: Lemna,
  paths: string[],
): Promise<{
  successCount: number;
  matchedCount: number;
  errorCount: number;
}> {
  client.logger.silly(`Deploy paths:`);
  client.logger.silly(formatJson(paths));

  let successCount = 0;
  let errorCount = 0;

  for await (const path of fileVisitor(paths)) {
    try {
      await deployWithConfigPath(client, path);
      successCount++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      client.logger.warn(`Error deploying ${path}: ${error.message}`);
      client.logger.silly(error.stack);
      errorCount++;
    }
  }

  const matchedCount = successCount + errorCount;

  return { matchedCount, successCount, errorCount };
}
