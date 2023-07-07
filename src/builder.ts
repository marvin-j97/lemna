import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { bundleCode } from "./bundle";
import { Config, loadConfig } from "./config";
import { Lemna } from "./lemna";
import { formatJson, getTempFolderPath } from "./util";
import { composeZip, saveZip } from "./zip";

/**
 * Generates a random hash for build artifacts
 */
function createBuildHash(): string {
  return randomBytes(4).toString("hex");
}

export interface BuildResult {
  buildHash: string;
  zipFile: string;
}

/**
 * Builds stuff
 */
export class Builder {
  private _client: Lemna;

  /**
   * Gets builder
   */
  constructor(client: Lemna) {
    this._client = client;
  }

  /**
   * Run build steps
   */
  private runBuildSteps(cwd: string, steps: string[]): void {
    for (const step of steps) {
      this._client.logger.silly(`Build step, EXEC: ${cwd}:${step}`);
      execSync(step, { cwd, stdio: "inherit" });
    }
  }

  /**
   * Builds a project according with the config given at path
   */
  async run(configPath: string): Promise<BuildResult & { config: Config }> {
    const config = await loadConfig(configPath, this._client.logger);

    const projectDir = dirname(configPath);
    const entryPoint = resolve(projectDir, config.entryPoint);
    const hash = createBuildHash();

    this._client.logger.info(`Building project with entrypoint ${entryPoint}`);
    this._client.logger.silly(formatJson(config));

    // Build steps
    this.runBuildSteps(projectDir, config.buildSteps ?? []);

    // Bundle
    const tmpFolder = getTempFolderPath(projectDir);
    const bundleOutputFolder = resolve(tmpFolder, hash);
    mkdirSync(bundleOutputFolder, { recursive: true });

    const bundleOutput = resolve(
      bundleOutputFolder,
      config.function.moduleFormat === "cjs" ? "index.js" : "index.mjs",
    );
    await bundleCode({
      input: entryPoint,
      output: bundleOutput,
      version: config.function.runtime,
      moduleFormat: config.function.moduleFormat,
      esbuildOptions: config.esbuild ?? {},
      logger: this._client.logger,
    });

    // Zip
    const zipFile = resolve(bundleOutputFolder, "bundle.zip");
    const zip = await composeZip({
      projectDir,
      bundlePath: bundleOutput,
      moduleFormat: config.function.moduleFormat,
      extraFiles: config.bundle,
      logger: this._client.logger,
    });

    const zipPath = resolve(projectDir, config.output ?? zipFile);
    await saveZip(zip, zipPath);

    return {
      buildHash: hash,
      zipFile: zipPath,
      config,
    };
  }
}