import glob from "glob";
import { writeFileSync } from "node:fs";
import { promisify } from "node:util";

import logger from "./logger";

/**
 * Stringifies JSON into readable format
 */
export function formatJson<T>(json: T): string {
  return JSON.stringify(json, null, 2);
}

/**
 * Writes content to a file
 */
export function loggedWriteFile(path: string, content: string): void {
  logger.silly(`Writing to file ${path} with ${content.length} characters`);
  writeFileSync(path, content);
}

export const globPromise = promisify(glob);

/**
 * Finds all files described by multiple glob patterns
 */
export async function globFiles(input: string[], cwd: string): Promise<string[]> {
  const files = [
    ...new Set(
      (
        await Promise.all(
          input.map((item) => globPromise(item, { cwd, nodir: true, absolute: true })),
        )
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
    const files = await globPromise(globExp, { cwd });

    logger.silly("Glob result:");
    logger.silly(files);

    for (const file of files) {
      yield file;
    }
  }
}
