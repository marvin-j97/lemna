import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";

import { ILemnaConfig } from "./config";
import { logger } from "./logger";
import { runTemplate, TemplateType } from "./templates/index";
import { formatJson, loggedWriteFile } from "./util";

/**
 * Creates a Lemna config file
 */
function composeLemnaConfig(
  name: string,
  entryPoint: string,
  buildSteps: string[] = [],
): ILemnaConfig {
  logger.silly(`Composing lemna.config.json for ${name}`);
  return {
    entryPoint,
    buildSteps,
    bundle: [],
    function: {
      name,
      description: "Created by Lemna",
      handler: "index.handler",
      memorySize: 128,
      runtime: "nodejs14.x",
      env: undefined,
      timeout: undefined,
    },
    rollup: undefined,
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
export async function initializeLemna(
  path: string,
  functionName: string,
  template: TemplateType,
): Promise<void> {
  const projectDir = resolve(path);

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
  const cmd = "npm i lemna -D";
  logger.debug(`EXEC ${cmd} @ ${projectDir}`);
  execSync(cmd, { cwd: projectDir });

  const { entryPoint, buildSteps } = await runTemplate(template, projectDir);

  const lemnaConfigPath = resolve(projectDir, "lemna.config.json");
  loggedWriteFile(
    lemnaConfigPath,
    formatJson(composeLemnaConfig(functionName, entryPoint, buildSteps)),
  );
}
