import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { relative, resolve } from "node:path";

import { RuntimeVersion } from "../config";
import { getInstallCommand, NPMClient } from "../npm_client";
import { formatJson, writeToFile } from "../util";

/**
 * Creates tsconfig.json
 */
function composeTsConfig(): unknown {
  return {
    exclude: ["node_modules", "test", "build"],
    compilerOptions: {
      target: "ESNext",
      module: "ESNext",

      noEmit: true,
      rootDir: "src",
      baseUrl: "src",
      outDir: "build",

      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      strictFunctionTypes: true,
      strictBindCallApply: true,
      strictPropertyInitialization: true,
      noImplicitThis: true,
      alwaysStrict: true,

      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,

      esModuleInterop: true,

      moduleResolution: "Node",

      types: ["streamify.d.ts"],
    },
  };
}

/**
 * Creates handler entry point
 */
function composeIndexFile(): string {
  return `import type { Handler } from "aws-lambda";

export const handler: Handler = async function (event, context) {
  console.log("Hello from Lemna");
  console.log("EVENT:");
  console.log(JSON.stringify(event, null, 2));
  return context.logStreamName;
};
`;
}

/**
 * Monkey patch for streamifyResponse
 */
function composeResponseStreamMonkeyPatch(): string {
  return `import { Context } from "aws-lambda";

  type ResponseStream = {
    write: (str: any) => void;
    end: () => void;
  };
  
  declare global {
    const awslambda: {
      /**
       * Read more at https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html
       */
      streamifyResponse: (
        fn: (event: unknown, responseStream: ResponseStream, context: Context) => Promise<unknown>,
      ) => void;
    };
  }
  
  export default global;
`;
}

/**
 * Creates the Typescript template
 */
export async function runTypescriptTemplate(
  projectDir: string,
  npmClient: NPMClient,
  runtime: RuntimeVersion,
): Promise<{ entryPoint: string }> {
  const srcFolder = resolve(projectDir, "src");

  mkdirSync(srcFolder, {
    recursive: true,
  });

  const tsconfigPath = resolve(projectDir, "tsconfig.json");
  writeToFile(tsconfigPath, formatJson(composeTsConfig()));

  const indexFile = resolve(srcFolder, "index.ts");
  writeToFile(indexFile, composeIndexFile());

  const responseStreamMonkeyPatchFile = resolve(projectDir, "streamify.d.ts");
  writeToFile(responseStreamMonkeyPatchFile, composeResponseStreamMonkeyPatch());

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const nodeVersion = runtime.match(/^nodejs(\d+).x$/)![1];

  const deps = ["@types/aws-lambda", "typescript", `@types/node@${nodeVersion}`];

  const cmd = `${getInstallCommand(npmClient)} -DE ${deps.join(" ")}`;
  execSync(cmd, { cwd: projectDir, stdio: "inherit" });

  return {
    entryPoint: relative(projectDir, indexFile),
  };
}
