import { createWriteStream, mkdirSync } from "fs";
import jszip from "jszip";
import { dirname } from "path";

import { logger } from "./logger";

/**
 * Saves a zip archive to disk
 */
export async function saveZip(zip: jszip, output: string): Promise<void> {
  mkdirSync(dirname(output), { recursive: true });
  logger.verbose(`Saving zip file to ${output}`);
  await new Promise<void>((resolve, reject) => {
    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(createWriteStream(output))
      .on("finish", resolve)
      .on("error", reject);
  });
}
