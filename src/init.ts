import { execSync } from "child_process";
import { IConfig } from "./config";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { formatJson } from "./util";
import { logger } from "./logger";

function loggedWriteFile(path: string, content: string): void {
  logger.silly(`Writing to file ${path} with ${content.length} characters`);
  writeFileSync(path, content);
}

function composeLemnaConfig(name: string): IConfig {
  logger.silly(`Composing lemna config for ${name}`);
  return {
    entryPoint: "./build/index.js",
    functionName: name,
    buildSteps: ["npx tsc"],
    bundle: [],
  };
}

function composeTsConfig(): unknown {
  logger.silly(`Composing tsconfig`);
  return {
    exclude: ["node_modules", "test", "build"],
    compilerOptions: {
      target: "es5",
      module: "commonjs",

      rootDir: "src",
      baseUrl: "src",
      outDir: "build",

      strict: true /* Enable all strict type-checking options. */,
      noImplicitAny: true /* Raise error on expressions and declarations with an implied 'any' type. */,
      strictNullChecks: true /* Enable strict null checks. */,
      strictFunctionTypes: true /* Enable strict checking of function types. */,
      strictBindCallApply: true /* Enable strict 'bind', 'call', and 'apply' methods on functions. */,
      strictPropertyInitialization: true /* Enable strict checking of property initialization in classes. */,
      noImplicitThis: true /* Raise error on 'this' expressions with an implied 'any' type. */,
      alwaysStrict: true /* Parse in strict mode and emit "use strict" for each source file. */,

      noUnusedLocals: true /* Report errors on unused locals. */,
      noUnusedParameters: true /* Report errors on unused parameters. */,
      noImplicitReturns: true /* Report error when not all code paths in function return a value. */,
      noFallthroughCasesInSwitch: true /* Report errors for fallthrough cases in switch statement. */,

      esModuleInterop: true,
    },
  };
}

function composePackageJson(name: string): unknown {
  logger.silly(`Composing package json for ${name}`);
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

function composeIndexFile(): string {
  logger.silly(`Composing index.handler`);
  return `import { Handler } from "aws-lambda";

const handler: Handler = async function (event, context) {
  console.log("Hello from Lemna");
  console.log("EVENT: \\n" + JSON.stringify(event, null, 2));
  return context.logStreamName;
};

exports.handler = handler;
`;
}

export async function initializeLemna(
  path: string,
  functionName: string,
): Promise<void> {
  logger.info("Initializing Lemna project");

  const projectDir = resolve(path);
  const srcFolder = resolve(path, "src");

  if (!existsSync(projectDir)) {
    logger.debug(`Creating project folder at ${projectDir}`);
    mkdirSync(projectDir, {
      recursive: true,
    });
    logger.debug(`Creating src folder at ${projectDir}`);
    mkdirSync(srcFolder, {
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

  const tsconfigPath = resolve(projectDir, "tsconfig.json");
  loggedWriteFile(tsconfigPath, formatJson(composeTsConfig()));

  const lemnaConfigPath = resolve(projectDir, "lemna.config.json");
  loggedWriteFile(
    lemnaConfigPath,
    formatJson(composeLemnaConfig(functionName)),
  );

  const indexFile = resolve(srcFolder, "index.ts");
  loggedWriteFile(indexFile, composeIndexFile());

  logger.verbose("Installing dependencies");
  execSync("npm i lemna @types/aws-lambda typescript -D", { cwd: projectDir });
}
