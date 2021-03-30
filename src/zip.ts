import { createWriteStream } from "fs";
import jszip from "jszip";

import { logger } from "./logger";

export async function saveZip(zip: jszip, output: string): Promise<void> {
  logger.verbose(`Saving zip file to ${output}`);
  await new Promise<void>((resolve, reject) => {
    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(createWriteStream(output))
      .on("finish", resolve)
      .on("error", reject);
  });
}
