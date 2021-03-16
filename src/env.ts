import { existsSync } from "fs";
import dotenv from "dotenv";
import { logger } from "./logger";

export function tryLoadEnv(path = ".env"): void {
  if (existsSync(path)) {
    logger.debug(`Loading env: ${path}`);
    dotenv.config({ path });
    logger.verbose(`Loaded env: ${path}`);
  } else {
    logger.debug(`No ${path} file found`);
  }
}
