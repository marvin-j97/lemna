import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { glob } from "glob";

import { RuntimeVersion } from "./config";

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
export async function globFiles(input: string[], cwd: string): Promise<string[]> {
  const files = [
    ...new Set(
      (
        await Promise.all(input.map((item) => glob(item, { cwd, nodir: true, absolute: true })))
      ).flat(),
    ),
  ];
  return files;
}

/**
 * Visit files described by multiple glob expressions
 */
export async function* fileVisitor(globs: string[], cwd = process.cwd()): AsyncGenerator<string> {
  for (const globExp of globs) {
    const files = await glob(globExp, { cwd });

    for (const file of files) {
      yield file;
    }
  }
}

const HAS_V3_REGEX = /^nodejs(18|20).x$/;

/**
 * Returns true if the runtime version has aws-sdk v3 built in
 */
export function hasV3(version: RuntimeVersion): boolean {
  return HAS_V3_REGEX.test(version);
}

/**
 * Returns the path of the temp folder (.lemna)
 */
export function getTempFolderPath(folder: string): string {
  return resolve(folder, ".lemna");
}
