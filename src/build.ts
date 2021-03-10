import {
  getConfig,
  getProjectDirectory,
  getTempFolder,
  loadConfig,
} from "./config";
import { execSync } from "child_process";
import { resolve } from "path";
import crypto from "crypto";
import { createReadStream, mkdirSync } from "fs";
import jszip from "jszip";
import { saveZip } from "./zip";
import { bundleCode } from "./bundle";
import glob from "glob";
import { promisify } from "util";

const globPromise = promisify(glob);

function buildHash(): string {
  return crypto.randomBytes(20).toString("hex");
}

interface IBuildResult {
  buildHash: string;
  zipFile: string;
}

export async function build(configPath: string): Promise<IBuildResult> {
  loadConfig(configPath);

  const config = getConfig();
  const projectDir = getProjectDirectory();

  const hash = buildHash();

  // Transpile
  console.error("tsc");
  execSync("tsc", { cwd: projectDir });

  // Bundle
  const entryPoint = resolve(projectDir, config.entryPoint);

  const outputFolder = resolve(getTempFolder(projectDir), hash);
  mkdirSync(outputFolder, { recursive: true });

  const output = resolve(outputFolder, "index.js");
  await bundleCode(entryPoint, output);

  const zipFile = resolve(outputFolder, "bundle.zip");

  // Zip
  console.error("zip");
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
      console.error(`Adding ${path} to zip at ${file}`);
      zip.file(file, createReadStream(path));
    }
  }

  await saveZip(zip, zipFile);

  // Done
  console.error(`Build done: ${zipFile}`);

  return {
    buildHash: hash,
    zipFile,
  };
}
