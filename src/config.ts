import yxc, { Infer, is } from "@dotvirus/yxc";
import { existsSync, mkdirSync } from "fs";
import { parse, resolve } from "path";
import { logger } from "./logger";

const configSchema = yxc.object({
  functionName: yxc.string().notEmpty(),
  entryPoint: yxc.string().notEmpty(),
  bundle: yxc.array(yxc.string().notEmpty()).optional(),
  buildSteps: yxc.array(yxc.string().notEmpty()).optional(),
});

export type IConfig = Infer<typeof configSchema>;

export function isValidConfig(val: unknown): val is IConfig {
  return is(val, configSchema);
}

let config: IConfig;
let projectDir: string;

export function getConfig(): IConfig {
  return JSON.parse(JSON.stringify(config));
}

export function getProjectDirectory(): string {
  return projectDir;
}

export function getTempFolder(folder: string): string {
  return resolve(folder, ".lemna");
}

export function loadConfig(file: string): IConfig {
  const path = resolve(file);
  logger.debug(`Loading config at ${path}`);

  if (!existsSync(path)) {
    logger.error(`Config not found at ${path}`);
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let content = require(path);

  if (typeof content === "function") {
    logger.error(`Config is a function, executing`);
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
