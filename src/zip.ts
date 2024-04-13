import { createReadStream, createWriteStream, mkdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

import globParent from "glob-parent";
import JSZip from "jszip";

import type { ModuleFormat } from "./config";
import type { Logger } from "./logger";
import { globFiles } from "./util";

/**
 * Saves a zip archive to disk
 */
export async function saveZip(zip: JSZip, output: string): Promise<void> {
  mkdirSync(dirname(output), { recursive: true });

  await new Promise<void>((resolve, reject) => {
    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(createWriteStream(output))
      .on("finish", resolve)
      .on("error", reject);
  });
}

type ZipOptions = {
  projectDir: string;
  bundlePath: string;
  moduleFormat: ModuleFormat;
  extraFiles?: Record<string, string[]>;
  logger: Logger;
};

/**
 * Composes a zip file using a JS bundle + extra files described by glob patterns
 */
export async function composeZip({
  projectDir,
  bundlePath,
  moduleFormat,
  extraFiles,
  logger,
}: ZipOptions): Promise<JSZip> {
  logger.debug(`Composing zip file`);
  const zip = new JSZip();

  zip.file("package.json", createReadStream(resolve(projectDir, "package.json")));
  zip.file(moduleFormat === "cjs" ? "index.js" : "index.mjs", createReadStream(bundlePath));

  for (const [base, patterns] of Object.entries(extraFiles ?? {})) {
    const files = await globFiles(patterns, projectDir);

    if (!files.length) {
      logger.warn(`No files found for "${base}" (glob patterns: ${JSON.stringify(patterns)}`);
    } else {
      const folder = resolve(globParent(files[0]));

      for (const file of files) {
        const relativePath = relative(folder, file);
        const redirectedPath = join(base, relativePath);
        logger.silly(`Adding ${file} to zip at ${redirectedPath}`);
        zip.file(redirectedPath, createReadStream(file));
      }
    }
  }

  return zip;
}
