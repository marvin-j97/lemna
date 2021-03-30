import { execSync } from "child_process";
import crypto from "crypto";
import { createReadStream, mkdirSync } from "fs";
import glob from "glob";
import jszip from "jszip";
import { resolve } from "path";
import { promisify } from "util";

import { bundleCode } from "./bundle";
import { getProjectDirectory, getTempFolder, IConfig } from "./config";
import { logger } from "./logger";
import { saveZip } from "./zip";

const globPromise = promisify(glob);

function buildHash(): string {
  return crypto.randomBytes(20).toString("hex");
}

interface IBuildResult {
  buildHash: string;
  zipFile: string;
}

export async function build(config: IConfig): Promise<IBuildResult> {
  logger.info(`Building project`);

  const projectDir = getProjectDirectory();

  const hash = buildHash();

  // Build steps
  for (const step of config.buildSteps || []) {
    logger.debug(`Build step: ${step}`);
    execSync(step, { cwd: projectDir });
  }

  // Bundle
  const entryPoint = resolve(projectDir, config.entryPoint);

  const outputFolder = resolve(getTempFolder(projectDir), hash);
  mkdirSync(outputFolder, { recursive: true });

  const output = resolve(outputFolder, "index.js");
  await bundleCode(entryPoint, output);

  const zipFile = resolve(outputFolder, "bundle.zip");

  // Zip
  logger.debug(`Composing zip file`);
  const zip = new jszip();

  zip.file(
    "package.json",
    createReadStream(resolve(projectDir, "package.json")),
  );
  zip.file("index.js", createReadStream(output));

  if (config.bundle && config.bundle.length) {
    const files = [
      ...new Set(
        (
          await Promise.all(
            config.bundle.map((item) =>
              globPromise(item, { cwd: projectDir, nodir: true }),
            ),
          )
        ).flat(),
      ),
    ];
    for (const file of files) {
      const path = resolve(projectDir, file);
      logger.silly(`Adding ${path} to zip at ${file}`);
      zip.file(file, createReadStream(path));
    }
  }

  await saveZip(zip, zipFile);

  return {
    buildHash: hash,
    zipFile,
  };
}
