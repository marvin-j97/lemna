import yxc, { Infer, is } from "@dotvirus/yxc";
import { existsSync, mkdirSync } from "fs";
import { parse, resolve } from "path";

const configSchema = yxc.object({
  functionName: yxc.string().notEmpty(),
  entryPoint: yxc.string().notEmpty(),
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

export function getTempFolder(folder: string) {
  return resolve(folder, ".lemna");
}

export function loadConfig(file: string) {
  const path = resolve(file);
  console.log(`Loading config at ${path}`);

  if (!existsSync(path)) {
    console.error(`Config not found at ${path}`);
    process.exit(1);
  }

  let content = require(path);

  if (typeof content === "function") {
    console.error(`Config is a function, executing`);
    content = content();
  }

  if (!isValidConfig(content)) {
    console.error(`Invalid config at ${path}`);
    process.exit(1);
  }

  config = content;
  projectDir = parse(path).dir;

  const tmpFolder = getTempFolder(projectDir);

  // if (existsSync(tmpFolder)) {
  //   console.error(`rm -rf ${tmpFolder}`);
  //   rmSync(tmpFolder, { force: true, recursive: true });
  // }

  if (!existsSync(tmpFolder)) {
    console.error(`mkdir ${tmpFolder}`);
    mkdirSync(tmpFolder, { recursive: true });
  }

  console.error("Loaded config");
}
