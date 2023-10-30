import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { relative, resolve } from "node:path";

import type { ModuleFormat, RuntimeVersion } from "../config";
import { getInstallCommand, type NPMClient } from "../npm_client";
import { formatJson, writeToFile } from "../util";

/**
 * Creates tsconfig.json
 */
function composeTsConfig(moduleFormat: ModuleFormat): unknown {
  return {
    exclude: ["node_modules", "test", "build"],
    compilerOptions: {
      target: "ESNext",
      module: moduleFormat === "esm" ? "ESNext" : "CommonJS",

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
function composeIndexFile(moduleFormat: ModuleFormat): string {
  return `import type { Handler } from "aws-lambda";

const handler: Handler = async (event, context) => {
  console.log("Hello from Lemna");
  console.log("EVENT:");
  console.log(JSON.stringify(event, null, 2));
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from Lemna",
      event
    })
  };
};

${moduleFormat === "esm" ? "export { handler };" : "exports.handler = handler;"}
`;
}

/**
 * Monkey patch for streamifyResponse
 */
function composeResponseStreamMonkeyPatch(): string {
  return `import { Context } from "aws-lambda";

  // NOTE: Help improve this type def! https://github.com/marvin-j97/lemna/blob/main/src/templates/typescript.ts#L74C1-L74C1

  // TODO: inherit from Node Stream: https://aws.amazon.com/de/blogs/compute/introducing-aws-lambda-response-streaming/
  // The responseStream object implements Node's Writable Stream API

  type ResponseStream = {
    write: (str: any) => void;
    end: () => void;
    setContentType: (resType: string) => void;
  };
  
  declare global {
    const awslambda: {
      /**
       * Read more at https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html
       */
      streamifyResponse: <T = unknown>(
        fn: (event: T, responseStream: ResponseStream, context: Context) => Promise<unknown>,
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
  moduleFormat: ModuleFormat,
): Promise<{ entryPoint: string }> {
  const srcFolder = resolve(projectDir, "src");

  mkdirSync(srcFolder, {
    recursive: true,
  });

  const tsconfigPath = resolve(projectDir, "tsconfig.json");
  writeToFile(tsconfigPath, formatJson(composeTsConfig(moduleFormat)));

  const indexFile = resolve(srcFolder, "index.ts");
  writeToFile(indexFile, composeIndexFile(moduleFormat));

  // NOTE: TODO: ideally AWS provides types at some point
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
