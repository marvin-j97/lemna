import { Config } from "./config";

export { Lemna } from "./lemna";
export { Config };
export { buildCommand as build } from "./commands/build";
export { deployCommand as deploy } from "./commands/deploy";
export { listCommand as listFunctions } from "./commands/ls";
export { getFunctionCommand as getFunction } from "./commands/read";
export { removeCommand as deleteFunctions } from "./commands/rm";
export { Logger } from "./logger";

/**
 * Helper function to define configs with Typescript intellisense
 */
export function defineConfig(config: Config): Config {
  return config;
}
