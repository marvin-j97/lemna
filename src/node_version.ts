import { z } from "zod";

import type { RuntimeVersion } from "./config";

export const allSupportedNodeRuntimes = ["nodejs20.x", "nodejs22.x", "nodejs24.x"] as const;

export const runtimeSchema = z.enum(allSupportedNodeRuntimes);

/**
 * Returns true if the version has reached EOL
 *
 * EOL versions may still be supported by Lambda for some time
 */
export function isEOL(_version: RuntimeVersion): boolean {
  return false;
}
