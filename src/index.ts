import { LemnaConfig } from "./config";

export { buildCommand as build } from "./commands/build";
export { deployCommand as deploy } from "./commands/deploy";
export { listCommand as listFunctions } from "./commands/ls";
export { readFunctionDetails as readFunction } from "./commands/read";
export { rmCommand as deleteFunction } from "./commands/rm";
export { LemnaConfig };

/**
 * Helper function to define configs with Typescript intellisense
 */
export function defineConfig(config: LemnaConfig): LemnaConfig {
  return config;
}
