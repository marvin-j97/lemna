import { readFileSync } from "node:fs";

import version from "./src/version";

const releaseVersion = process.argv[2];
const pkg = JSON.parse(readFileSync("package.json", "utf-8"))

if (pkg.version === version && version === releaseVersion) {
  console.log("Version OK");
  process.exit(0);
}

console.log("Version mismatch");
process.exit(1);
