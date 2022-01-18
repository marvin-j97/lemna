import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import inquirer from "inquirer";
import { resolve } from "path";

import { installCommand, NPMClient } from "./npm_client";
import { ILemnaConfig } from "./config";
import { logger } from "./logger";
import { runTemplate, TemplateType } from "./templates/index";
import { formatJson, loggedWriteFile } from "./util";

/**
 * Creates a Lemna config file
 */
function composeLemnaConfig(functionName: string, entryPoint: string): ILemnaConfig {
  logger.silly(`Composing lemna.config.json for ${functionName}`);
  return {
    entryPoint,
    output: undefined,
    buildSteps: [],
    bundle: {},
    function: {
      name: functionName,
      description: "Created by Lemna",
      handler: "index.handler",
      memorySize: 128,
      runtime: "nodejs14.x",
      env: undefined,
      timeout: undefined,
    },
    buildOptions: {
      minify: false,
    },
  };
}

/**
 * Creates a package.json
 */
function composePackageJson(name: string): unknown {
  logger.silly(`Composing package.json for ${name}`);
  return {
    name,
    version: "1.0.0",
    description: "Created by Lemna",
    main: "build/index.js",
    scripts: {
      deploy: `lemna deploy`,
      test: 'echo "Error: no test specified" && exit 1',
    },
    keywords: ["lambda", "lemna"],
    author: "",
    license: "ISC",
  };
}

/**
 * Initializes a project
 */
export async function initializeLemna(path: string): Promise<{ npmClient: NPMClient }> {
  const projectDir = resolve(path);

  const { functionName, template, memorySize, npmClient } = await inquirer.prompt([
    {
      name: "npmClient",
      type: "list",
      message: "Select NPM client",
      choices: Object.values(NPMClient),
      default: NPMClient.Npm,
    },
    {
      name: "functionName",
      type: "input",
      message: "Enter function name",
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
      name: "template",
      choices: Object.values(TemplateType),
      type: "list",
      message: "Select template",
      default: TemplateType.Typescript,
    },
  ]);

  logger.info(`Initializing Lemna project at ${projectDir}`);
  logger.verbose(`Using template "${template}"`);

  if (!existsSync(projectDir)) {
    logger.debug(`Creating project folder at ${projectDir}`);
    mkdirSync(projectDir, {
      recursive: true,
    });
  } else {
    // TODO: overwrite?
    logger.error(`Folder ${projectDir} already in use`);
    process.exit(2);
  }

  const packageJsonPath = resolve(projectDir, "package.json");
  loggedWriteFile(packageJsonPath, formatJson(composePackageJson(functionName)));

  logger.verbose("Installing dependencies");
  const cmd = `${installCommand(npmClient)} -D lemna`;
  logger.debug(`EXEC ${projectDir}:${cmd}`);
  execSync(cmd, { cwd: projectDir, stdio: "inherit" });

  const { entryPoint, buildSteps } = await runTemplate(template, projectDir, npmClient);

  const lemnaConfigPath = resolve(projectDir, "lemna.config.json");
  const config = composeLemnaConfig(functionName, entryPoint);
  config.buildSteps = buildSteps;
  config.function.memorySize = memorySize;
  loggedWriteFile(lemnaConfigPath, formatJson(config));

  return { npmClient };
}
