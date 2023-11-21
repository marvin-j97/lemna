import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type { Cors } from "@aws-sdk/client-lambda";
import { glob } from "glob";

import type { FunctionUrlSettings, RuntimeVersion } from "./config";

/**
 * Format cors argument into AWS Cors object
 */
export function formatCors(
  cors: FunctionUrlSettings["cors"],
): Cors | undefined {
  if (!cors) {
    return undefined;
  }

  if (cors === true) {
    return {
      AllowCredentials: true,
      AllowHeaders: ["*"],
      AllowMethods: ["*"],
      AllowOrigins: ["*"],
      ExposeHeaders: ["*"],
      MaxAge: 3600,
    };
  }

  return {
    AllowCredentials: cors.credentials,
    AllowHeaders: cors.headers,
    AllowMethods: cors.methods,
    AllowOrigins: cors.origins,
    ExposeHeaders: cors.exposeHeaders,
    MaxAge: cors.maxAge,
  };
}

/**
 * Stringifies JSON into readable format
 */
export function formatJson<T>(json: T): string {
  return JSON.stringify(json, null, 2);
}

/**
 * Writes content to a file
 */
export function writeToFile(path: string, content: string): void {
  writeFileSync(path, content, "utf-8");
}

/**
 * Finds all files described by multiple glob patterns
 */
export async function globFiles(
  globs: string[],
  cwd: string,
): Promise<string[]> {
  const files = [];

  for await (const file of fileVisitor(globs, cwd)) {
    files.push(file);
  }

  return [...new Set(files)];
}

/**
 * Visit files described by multiple glob expressions
 */
export async function* fileVisitor(
  globs: string[],
  cwd = process.cwd(),
): AsyncGenerator<string> {
  for (const globExp of globs) {
    const files = await glob(globExp, { cwd });

    for (const file of files) {
      yield file;
    }
  }
}

const HAS_V3_REGEX = /^nodejs(18|20|22).x$/;

/**
 * Returns true if the runtime version has aws-sdk v3 built in
 */
export function hasV3(version: RuntimeVersion): boolean {
  return HAS_V3_REGEX.test(version);
}

/**
 * Returns true if the version has reached EOL
 *
 * EOL versions may still be supported by Lambda for some time
 */
export function isEOL(version: RuntimeVersion): boolean {
  return version === "nodejs16.x";
}

/**
 * Returns the path of the temp folder (.lemna)
 */
export function getTempFolderPath(folder: string): string {
  return resolve(folder, ".lemna");
}
