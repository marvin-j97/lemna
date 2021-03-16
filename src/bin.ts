import { tryLoadEnv } from "./env";
import version from "./version";

tryLoadEnv();

console.error(`Lemna v${version}`);

import "./args";
