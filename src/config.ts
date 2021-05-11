import yxc, { Infer, is } from "@dotvirus/yxc";
import { existsSync, mkdirSync, statSync } from "fs";
import { parse, resolve } from "path";

import { logger } from "./logger";

const configSchema = yxc.object({
  functionName: yxc.string().notEmpty(),
  entryPoint: yxc.string().notEmpty(),
  bundle: yxc.array(yxc.string().notEmpty()).optional(),
  buildSteps: yxc.array(yxc.string().notEmpty()).optional(),
});

export type IConfig = Infer<typeof configSchema>;

/**
 * Returns if the given input is a valid Lemna config
 */
export function isValidConfig(val: unknown): val is IConfig {
  return is(val, configSchema);
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
    logger.error(`Config not found at ${path}`);
    process.exit(1);
  }

  if (statSync(path).isDirectory()) {
    logger.error(`${path} is a directory`);
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let content = require(path);

  if (typeof content === "function") {
    logger.verbose(`Config is a function, executing`);
    content = content();
  }

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
