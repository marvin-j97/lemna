import { existsSync, mkdirSync, statSync } from "fs";
import { parse, resolve } from "path";
import * as z from "zod";

import logger from "./logger";
import { formatJson } from "./util";

const functionSettingsSchema = z.object({
  arn: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  memorySize: z.number().int().min(1).optional(),
  handler: z.string().optional(),
  runtime: z.enum(["nodejs12.x", "nodejs14.x", "nodejs16.x"]),
  env: z.record(z.string()).optional(),
  tags: z.record(z.string()).optional(),
  timeout: z.number().optional(),
});

export type IFunctionSettings = z.TypeOf<typeof functionSettingsSchema>;

const configSchema = z.object({
  entryPoint: z.string().min(1),
  output: z.string().min(1).optional(),
  bundle: z.record(z.array(z.string().min(1))).optional(),
  buildSteps: z.array(z.string().min(1)).optional(),
  function: functionSettingsSchema,
  buildOptions: z.object({}).optional(),
});

export type LemnaConfig = z.TypeOf<typeof configSchema>;

/**
 * Returns if the given input is a valid Lemna config
 */
export function isValidConfig(val: unknown): val is LemnaConfig {
  const result = configSchema.safeParse(val);
  if (result.success) {
    return true;
  }
  logger.error(
    `${result.error.issues.length} validation errors: ${formatJson(result.error.issues)}`,
  );
  return false;
}

let config: LemnaConfig;
let projectDir: string;

/**
 * Returns the loaded config
 */
export function getConfig(): LemnaConfig {
  return JSON.parse(formatJson(config));
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
export function loadConfig(file: string): LemnaConfig {
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

  if (content.default) {
    content = content.default;
  }

  if (typeof content === "function") {
    logger.verbose(`Config is a function, executing`);
    content = content();
  }

  logger.silly("Loaded config:");
  logger.silly(formatJson(content));

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
