import { existsSync } from "node:fs";

import dotenv from "dotenv";

/**
 * Loads an environment variable file if it exists
 */
export function tryLoadEnv(path = ".env"): void {
  if (existsSync(path)) {
    console.error(`Loading env: ${path}`);
    dotenv.config({ path });
    console.error(`Loaded env: ${path}`);
  } else {
    console.error(`No ${path} file found`);
  }
}
