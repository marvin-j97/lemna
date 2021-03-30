import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";

import { IConfig } from "./config";
import { logger } from "./logger";
import { templateMap, TemplateType } from "./templates/index";
import { formatJson, loggedWriteFile } from "./util";

function composeLemnaConfig(
  name: string,
  entryPoint: string,
  buildSteps: string[] = [],
): IConfig {
  logger.silly(`Composing lemna.config.json for ${name}`);
  return {
    entryPoint,
    functionName: name,
    buildSteps,
    bundle: [],
  };
}

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

export async function initializeLemna(
  path: string,
  functionName: string,
  template: TemplateType,
): Promise<void> {
  logger.info("Initializing Lemna project");
  logger.verbose(`Using template "${template}"`);

  const projectDir = resolve(path);

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
  loggedWriteFile(
    packageJsonPath,
    formatJson(composePackageJson(functionName)),
  );

  logger.verbose("Installing dependencies");
  execSync("npm i lemna -D", { cwd: projectDir });

  const { entryPoint, buildSteps } = await templateMap[template](projectDir);

  const lemnaConfigPath = resolve(projectDir, "lemna.config.json");
  loggedWriteFile(
    lemnaConfigPath,
    formatJson(composeLemnaConfig(functionName, entryPoint, buildSteps)),
  );
}
