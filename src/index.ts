import type { Config } from "./config";

export { Lemna } from "./lemna";
export { buildCommand as build } from "./commands/build";
export { deployCommand as deploy } from "./commands/deploy";
export { listCommand as listFunctions } from "./commands/ls";
export { getFunctionCommand as getFunction } from "./commands/read";
export { removeCommand as deleteFunctions } from "./commands/rm";

export type { Config };
export type { Logger } from "./logger";
