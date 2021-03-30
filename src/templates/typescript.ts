import { execSync } from "child_process";
import { mkdirSync } from "fs";
import { resolve, relative } from "path";

import { logger } from "../logger";
import { formatJson, loggedWriteFile } from "../util";
import { TemplateFunction } from "./index";

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

export const runTypescriptTemplate: TemplateFunction = async (
  projectDir: string,
): Promise<{ entryPoint: string; buildSteps: string[] }> => {
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
  execSync("npm i @types/aws-lambda typescript -D", { cwd: projectDir });

  const buildIndex = resolve(projectDir, "./build/index.js");

  return {
    entryPoint: relative(projectDir, buildIndex),
    buildSteps: ["npx tsc"],
  };
};
