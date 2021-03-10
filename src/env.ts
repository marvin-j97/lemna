import { existsSync } from "fs";
import dotenv from "dotenv";

export function tryLoadEnv(path = ".env"): void {
  if (existsSync(path)) {
    console.error(`Loading env: ${path}`);
    dotenv.config({ path });
  }
}
