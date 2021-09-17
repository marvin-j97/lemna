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

/**
 * Generates a random hash for build artifacts
 */
function buildHash(): string {
  return crypto.randomBytes(12).toString("hex");
}

interface IBuildResult {
  buildHash: string;
  zipFile: string;
}

/**
 * Runs a series of build steps
 */
function runBuildSteps(steps: string[], cwd: string): void {
  for (const step of steps) {
    logger.debug(`Build step, EXEC: ${step} @ ${cwd}`);
    execSync(step, { cwd, stdio: "inherit" });
  }
}

/**
 * Builds a project according to the given config
 * Returns a build result
 */
export async function build(config: IConfig): Promise<IBuildResult> {
  const projectDir = getProjectDirectory();
  const entryPoint = resolve(projectDir, config.entryPoint);
  const hash = buildHash();

  logger.info(`Building project with entrypoint ${entryPoint}`);

  // Build steps
  runBuildSteps(config.buildSteps || [], projectDir);

  // Bundle

  const outputFolder = resolve(getTempFolder(projectDir), hash);
  mkdirSync(outputFolder, { recursive: true });

  const output = resolve(outputFolder, "index.js");
  await bundleCode(entryPoint, output, {
    commonjs: config.rollup?.commonjsOptions,
    json: config.rollup?.jsonOptions,
    nodeResolve: config.rollup?.nodeResolveOptions,
    plugins: config.rollup?.plugins,
  });

  // Zip
  const zipFile = resolve(outputFolder, "bundle.zip");
  logger.debug(`Composing zip file`);
  const zip = new jszip();

  zip.file("package.json", createReadStream(resolve(projectDir, "package.json")));
  zip.file("index.js", createReadStream(output));

  if (config.bundle && config.bundle.length) {
    const files = [
      ...new Set(
        (
          await Promise.all(
            config.bundle.map((item) => globPromise(item, { cwd: projectDir, nodir: true })),
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
