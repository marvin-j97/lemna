import yxc, { createExecutableSchema, Infer } from "@dotvirus/yxc";
import { existsSync, mkdirSync, statSync } from "fs";
import { parse, resolve } from "path";

import { logger } from "./logger";

const functionSettingsSchema = yxc.object({
  name: yxc.string().notEmpty(),
  description: yxc.string().optional(),
  memorySize: yxc.number().integer().min(1).optional(),
  handler: yxc.string().optional(),
  runtime: yxc.string().notEmpty(),
  env: yxc.record(yxc.string()).optional(),
});

export type IFunctionSettings = Infer<typeof functionSettingsSchema>;

const configSchema = yxc.object({
  entryPoint: yxc.string().notEmpty(),
  bundle: yxc.array(yxc.string().notEmpty()).optional(),
  buildSteps: yxc.array(yxc.string().notEmpty()).optional(),
  function: functionSettingsSchema,
});

export type IConfig = Infer<typeof configSchema>;

/**
 * Returns if the given input is a valid Lemna config
 */
export function isValidConfig(val: unknown): val is IConfig {
  const { ok, errors } = createExecutableSchema(configSchema)(val);
  if (errors.length) {
    logger.error(`${errors.length} validation errors: ${JSON.stringify(errors, null, 2)}`);
  }
  return ok;
}

let config: IConfig;
let projectDir: string;

/**
 * Returns the loaded config
 */
export function getConfig(): IConfig {
  return JSON.parse(JSON.stringify(config));
}

/**
 * Returns the path of the project directory (directory of config)
 */
export function getProjectDirectory(): string {
  return projectDir;
}

/**
 * Returns the path of the temp folder (.lemna)
 */
export function getTempFolder(folder: string): string {
  return resolve(folder, ".lemna");
}

/**
 * Loads a config from file (.json or .js)
 * Automatically creates temp folder next to the config
 */
export function loadConfig(file: string): IConfig {
  const path = resolve(file);
  logger.debug(`Loading config at ${path}`);

  if (!existsSync(path)) {
    throw new Error(`Config not found at ${path}`);
  }

  if (statSync(path).isDirectory()) {
    throw new Error(`${path} is a directory`);
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let content = require(path);

  if (typeof content === "function") {
    logger.verbose(`Config is a function, executing`);
    content = content();
  }

  logger.silly("Loaded config:");
  logger.silly(JSON.stringify(content, null, 2));

  if (!isValidConfig(content)) {
    console.error(`Invalid config at ${path}`);
    process.exit(1);
  }

  config = content;
  projectDir = resolve(parse(path).dir);
  logger.debug(`Project directory: ${projectDir}`);

  const tmpFolder = getTempFolder(projectDir);

  if (!existsSync(tmpFolder)) {
    logger.verbose(`Creating folder ${tmpFolder}`);
    mkdirSync(tmpFolder, { recursive: true });
  }

  return getConfig();
}
