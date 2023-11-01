import { parseArgs } from "./args";
import { tryLoadEnv } from "./env";

if (process.env.NODE_ENV) {
  tryLoadEnv(`.env.${process.env.NODE_ENV}.local`);
}
tryLoadEnv(`.env.local`);

if (process.env.NODE_ENV) {
  tryLoadEnv(`.env.${process.env.NODE_ENV}`);
}
tryLoadEnv();

parseArgs();
