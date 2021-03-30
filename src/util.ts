import { writeFileSync } from "fs";

import { logger } from "./logger";

export function formatJson<T>(json: T): string {
  return JSON.stringify(json, null, 2);
}

export function loggedWriteFile(path: string, content: string): void {
  logger.silly(`Writing to file ${path} with ${content.length} characters`);
  writeFileSync(path, content);
}
