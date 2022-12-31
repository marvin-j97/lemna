import { loadConfig } from "../config";
import { deployProject } from "../deploy";
import logger from "../logger";
import { fileVisitor, formatJson } from "../util";

/**
 * Deploy command
 */
export async function deployCommand(paths: string[]): Promise<{
  successCount: number;
  matchedCount: number;
  errorCount: number;
}> {
  logger.silly(`Deploy paths:`);
  logger.silly(formatJson(paths));

  let successCount = 0;
  let errorCount = 0;

  for await (const path of fileVisitor(paths)) {
    try {
      const config = await loadConfig(path);
      await deployProject(config);
      successCount++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(`Error deploying ${path}: ${error.message}`);
      logger.silly(error.stack);
      errorCount++;
    }
  }

  const matchedCount = successCount + errorCount;
  if (!matchedCount) {
    logger.error("No files matched the inputs");
    process.exit(1);
  }

  return { matchedCount, successCount, errorCount };
}
