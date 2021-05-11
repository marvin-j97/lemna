import { execSync } from "child_process";
import { mkdirSync } from "fs";
import { relative, resolve } from "path";

import { logger } from "../logger";
import { formatJson, loggedWriteFile } from "../util";
import { ITemplateResult, TemplateFunction } from "./index";

/**
 * Creates tsconfig.json
 */
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

/**
 * Creates handler entry point
 */
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

/**
 * Creates the Typescript template
 */
export const runTypescriptTemplate: TemplateFunction = async (
  projectDir: string,
): Promise<ITemplateResult> => {
  const srcFolder = resolve(projectDir, "src");
  logger.debug(`Creating src folder at ${projectDir}`);
  mkdirSync(srcFolder, {
    recursive: true,
  });

  const tsconfigPath = resolve(projectDir, "tsconfig.json");
  loggedWriteFile(tsconfigPath, formatJson(composeTsConfig()));

  const indexFile = resolve(srcFolder, "index.ts");
  loggedWriteFile(indexFile, composeIndexFile());

  logger.verbose("Installing Typescript dependencies");
  const cmd = "npm i @types/aws-lambda typescript -D";
  logger.debug(`EXEC ${cmd} @ ${projectDir}`);
  execSync(cmd, { cwd: projectDir });

  const buildIndex = resolve(projectDir, "./build/index.js");

  return {
    entryPoint: relative(projectDir, buildIndex),
    buildSteps: ["npx tsc"],
  };
};
