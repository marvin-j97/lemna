import { Lemna } from "../lemna";
import { fileVisitor, formatJson } from "../util";

type BuildItem = { zipFile: string; buildHash: string };

/**
 * Build command
 */
export async function buildCommand(
  client: Lemna,
  paths: string[],
): Promise<{
  results: BuildItem[];
  successCount: number;
  matchedCount: number;
  errorCount: number;
}> {
  client.logger.silly(`Build paths:`);
  client.logger.silly(formatJson(paths));

  let successCount = 0;
  let errorCount = 0;
  const results: BuildItem[] = [];

  for await (const path of fileVisitor(paths)) {
    try {
      const { buildHash, zipFile } = await client.buildAtPath(path);
      results.push({ buildHash, zipFile });
      successCount++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      client.logger.warn(`Error building ${path}: ${error.message}`);
      client.logger.silly(error.stack);
      errorCount++;
    }
  }

  const matchedCount = successCount + errorCount;

  return { results, successCount, matchedCount, errorCount };
}
