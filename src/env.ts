import { existsSync } from "node:fs";

import dotenv from "dotenv";

import logger from "./logger";

/**
 * Loads an environment variable file if it exists
 */
export function tryLoadEnv(path = ".env"): void {
  if (existsSync(path)) {
    logger.debug(`Loading env: ${path}`);
    dotenv.config({ path });
    logger.verbose(`Loaded env: ${path}`);
  } else {
    logger.debug(`No ${path} file found`);
  }
}
