import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

import inquirer from "inquirer";
import { runTypescriptTemplate } from "templates/typescript";

import { Config, ModuleFormat, RuntimeVersion } from "./config";
import { Lemna } from "./lemna";
import { getInstallCommand, NPMClient } from "./npm_client";
import { formatJson, writeToFile } from "./util";

/**
 * Creates a Lemna config file
 */
function composeLemnaConfig(
  functionName: string,
  entryPoint: string,
  moduleFormat: ModuleFormat,
): Config {
  return {
    entryPoint,
    buildSteps: [],
    bundle: {},
    function: {
      name: functionName,
      description: "Created by Lemna",
      handler: "index.handler",
      memorySize: 128,
      runtime: "nodejs16.x",
      moduleFormat,
    },
    esbuild: {
      minify: true,
    },
  };
}

/**
 * Creates a package.json
 */
function composePackageJson(name: string): unknown {
  return {
    name,
    version: "1.0.0",
    description: "Created by Lemna",
    scripts: {
      deploy: "lemna deploy",
      test: 'echo "Error: no test specified" && exit 1',
    },
    keywords: ["lambda", "lemna"],
  };
}

/* eslint-disable max-lines-per-function */

/**
 * Initializes a project
 */
export async function initializeLemna(client: Lemna): Promise<{
  projectDir: string;
  npmClient: NPMClient;
  nodeVersion: RuntimeVersion;
}> {
  const { dir, functionName, memorySize, timeout, npmClient, runtime, useEsm } =
    await inquirer.prompt([
      {
        name: "dir",
        type: "input",
        default: "my-function",
        message: "Enter project folder name",
        validate: (str) => !!str.length || "Must not be empty",
      },
      {
        name: "npmClient",
        type: "list",
        message: "Select NPM client",
        choices: ["npm", "pnpm", "yarn"] satisfies NPMClient[],
        default: "pnpm",
      },
      {
        name: "functionName",
        type: "input",
        message: "Enter function name",
        validate: (str) => !!str.length || "Must not be empty",
      },
      {
        name: "memorySize",
        type: "number",
        message: "Enter function memory size (in MB)",
        default: 128,
      },
      {
        name: "timeout",
        type: "number",
        message: "Enter function timeout seconds",
        default: 15,
      },
      {
        name: "runtime",
        choices: ["nodejs16.x", "nodejs18.x"] satisfies RuntimeVersion[],
        type: "list",
        message: "Select runtime",
        default: "nodejs18.x",
      },
      {
        name: "useEsm",
        type: "confirm",
        message: "Use ESM?",
      },
    ]);

  const projectDir = resolve(dir);

  client.logger.info(`Initializing Lemna project at ${projectDir}`);

  if (!existsSync(projectDir)) {
    client.logger.debug(`Creating project folder at ${projectDir}`);
    mkdirSync(projectDir, {
      recursive: true,
    });
  } else {
    client.logger.error(`Folder ${projectDir} already in use`);
    process.exit(2);
  }

  const packageJsonPath = resolve(projectDir, "package.json");
  writeToFile(packageJsonPath, formatJson(composePackageJson(functionName)));

  client.logger.verbose("Installing dependencies");
  const cmd = `${getInstallCommand(npmClient)} -DE lemna`;
  client.logger.debug(`EXEC ${projectDir}:${cmd}`);
  execSync(cmd, { cwd: projectDir, stdio: "inherit" });

  const moduleFormat: ModuleFormat = useEsm ? "esm" : "cjs";

  const { entryPoint } = await runTypescriptTemplate(projectDir, npmClient, runtime, moduleFormat);
  const lemnaConfigPath = resolve(projectDir, "lemna.config.mjs");
  const config = composeLemnaConfig(functionName, entryPoint, moduleFormat);

  config.function.memorySize = memorySize;
  config.function.timeout = timeout;
  config.function.runtime = runtime;

  writeToFile(
    lemnaConfigPath,
    `// @ts-check

/**
 * @type {import('lemna').Config}
 **/
const config = ${formatJson(config)};

export default config;
`,
  );

  return { projectDir, npmClient, nodeVersion: runtime };
}
