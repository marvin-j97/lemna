import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { rollup } from "rollup";
import {
  getConfig,
  getProjectDirectory,
  getTempFolder,
  loadConfig,
} from "./config";
import { execSync } from "child_process";
import { resolve } from "path";
import crypto from "crypto";
import { createReadStream, createWriteStream, mkdirSync } from "fs";
import jszip from "jszip";

function buildHash() {
  return crypto.randomBytes(20).toString("hex");
}

export async function bundleCode(entrypoint: string, output: string) {
  console.error("rollup");
  const bundle = await rollup({
    input: entrypoint,
    plugins: [json(), nodeResolve(), commonjs()],
  });
  console.error("rollup write");
  await bundle.write({
    file: output,
    format: "cjs",
  });
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

  zip.file("index.js", createReadStream(output));
  // TODO: build artifacts

  await new Promise<void>((resolve) => {
    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(createWriteStream(zipFile))
      .on("finish", () => {
        resolve();
      });
  });

  // Done
  console.log(`Build done: ${zipFile}`);

  return {
    buildHash: hash,
    zipFile,
  };
}
