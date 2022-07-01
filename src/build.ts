import { execSync } from "child_process";
import crypto from "crypto";
import { mkdirSync } from "fs";
import { resolve } from "path";

import { bundleCode } from "./bundle";
import { getProjectDirectory, getTempFolder, LemnaConfig } from "./config";
import logger from "./logger";
import { formatJson } from "./util";
import { composeZip, saveZip } from "./zip";

/**
 * Generates a random hash for build artifacts
 */
function buildHash(): string {
  return crypto.randomBytes(12).toString("hex");
}

interface IBuildResult {
  buildHash: string;
  zipFile: string;
  bundleOutput: string;
}

/**
 * Runs a series of build steps
 */
function runBuildSteps(steps: string[], cwd: string): void {
  for (const step of steps) {
    logger.debug(`Build step, EXEC: ${cwd}:${step}`);
    execSync(step, { cwd, stdio: "inherit" });
  }
}

/**
 * Builds a project according to the given config
 * Returns a build result
 */
export async function build(config: LemnaConfig): Promise<IBuildResult> {
  const projectDir = getProjectDirectory();
  const entryPoint = resolve(projectDir, config.entryPoint);
  const hash = buildHash();

  logger.info(`Building project with entrypoint ${entryPoint}`);
  logger.silly(formatJson(config));

  // Build steps
  runBuildSteps(config.buildSteps || [], projectDir);

  // Bundle
  const bundleOutputFolder = resolve(getTempFolder(projectDir), hash);
  mkdirSync(bundleOutputFolder, { recursive: true });

  const bundleOutput = resolve(bundleOutputFolder, "index.js");
  await bundleCode(entryPoint, bundleOutput, config.buildOptions || {});

  // Zip
  const zipFile = resolve(bundleOutputFolder, "bundle.zip");
  const zip = await composeZip(projectDir, bundleOutput, config.bundle);

  const zipPath = resolve(projectDir, config.output || zipFile);
  await saveZip(zip, zipPath);

  return {
    buildHash: hash,
    zipFile: zipPath,
    bundleOutput,
  };
}
