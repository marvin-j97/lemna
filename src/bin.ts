import { tryLoadEnv } from "./env";

if (process.env.NODE_ENV) {
  tryLoadEnv(`.env.${process.env.NODE_ENV}`);
}
tryLoadEnv();

import "./args";
