import { writeFileSync } from "fs";
import glob from "glob";
import { promisify } from "util";

import { logger } from "./logger";

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
