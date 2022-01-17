import { execSync } from "child_process";
import crypto from "crypto";
import { createReadStream, mkdirSync } from "fs";
import jszip from "jszip";
import { relative, resolve, join } from "path";
import globParent from "glob-parent";

import { bundleCode } from "./bundle";
import { getProjectDirectory, getTempFolder, ILemnaConfig } from "./config";
import { logger } from "./logger";
import { globFiles } from "./util";
import { saveZip } from "./zip";

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
export async function build(config: ILemnaConfig): Promise<IBuildResult> {
  const projectDir = getProjectDirectory();
  const entryPoint = resolve(projectDir, config.entryPoint);
  const hash = buildHash();

  logger.info(`Building project with entrypoint ${entryPoint}`);
  logger.silly(JSON.stringify(config, null, 2));

  // Build steps
  runBuildSteps(config.buildSteps || [], projectDir);

  // Bundle
  const bundleOutputFolder = resolve(getTempFolder(projectDir), hash);
  mkdirSync(bundleOutputFolder, { recursive: true });

  const bundleOutput = resolve(bundleOutputFolder, "index.js");
  await bundleCode(entryPoint, bundleOutput, {
    commonjs: config.rollup?.commonjsOptions,
    json: config.rollup?.jsonOptions,
    nodeResolve: config.rollup?.nodeResolveOptions,
    additionalPlugins: config.rollup?.additionalPlugins,
    overridePlugins: config.rollup?.overridePlugins,
    rollupOptions: config.rollup?.options,
  });

  // Zip
  const zipFile = resolve(bundleOutputFolder, "bundle.zip");
  logger.debug(`Composing zip file`);
  const zip = new jszip();

  zip.file("package.json", createReadStream(resolve(projectDir, "package.json")));
  zip.file("index.js", createReadStream(bundleOutput));

  for (const [base, patterns] of Object.entries(config.bundle)) {
    const files = await globFiles(patterns, projectDir);
    const folder = resolve(globParent(files[0]));

    for (const file of files) {
      const relativePath = relative(folder, file);
      console.log(relativePath);
      const redirectedPath = join(base, relativePath);
      logger.silly(`Adding ${file} to zip at ${redirectedPath}`);
      zip.file(redirectedPath, createReadStream(file));
    }
  }

  const zipPath = resolve(projectDir, config.output || zipFile);
  await saveZip(zip, zipPath);

  return {
    buildHash: hash,
    zipFile: zipPath,
  };
}
