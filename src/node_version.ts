import { z } from "zod";

import type { RuntimeVersion } from "./config";

const HAS_V3_REGEX = /^nodejs(18|20|22).x$/;

export const allSupportedNodeRuntimes = ["nodejs16.x", "nodejs18.x", "nodejs20.x"] as const;

export const runtimeSchema = z.enum(allSupportedNodeRuntimes);

/**
 * Returns true if the runtime version has aws-sdk v3 built in
 */
export function hasV3(version: RuntimeVersion): boolean {
  return HAS_V3_REGEX.test(version);
}

/**
 * Returns true if the version has reached EOL
 *
 * EOL versions may still be supported by Lambda for some time
 */
export function isEOL(version: RuntimeVersion): boolean {
  return version === "nodejs16.x";
}
