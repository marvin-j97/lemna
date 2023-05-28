import { build } from "../build";
import { loadConfig } from "../config";
import logger from "../logger";
import { fileVisitor, formatJson } from "../util";

type BuildItem = { zipFile: string; buildHash: string };

/**
 * Build command
 */
export async function buildCommand(paths: string[]): Promise<{
  results: BuildItem[];
  successCount: number;
  matchedCount: number;
  errorCount: number;
}> {
  logger.silly(`Build paths:`);
  logger.silly(formatJson(paths));

  let successCount = 0;
  let errorCount = 0;
  const results: BuildItem[] = [];

  for await (const path of fileVisitor(paths)) {
    try {
      const config = await loadConfig(path);
      const { zipFile, buildHash } = await build(config);
      logger.verbose(`Built zip file: ${zipFile}`);
      results.push({ zipFile, buildHash });
      successCount++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`Error building ${path}: ${error.message}`);
      logger.silly(error.stack);
      errorCount++;
    }
  }

  const matchedCount = successCount + errorCount;

  return { results, successCount, matchedCount, errorCount };
}
