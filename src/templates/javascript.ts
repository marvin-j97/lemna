import { mkdirSync } from "fs";
import { resolve, relative } from "path";
import { loggedWriteFile } from "../util";
import { logger } from "../logger";
import { TemplateFunction } from "./index";

function composeIndexFile(): string {
  logger.silly(`Composing index.handler`);
  return `const handler = async function (event, context) {
  console.log("Hello from Lemna");
  console.log("EVENT: \\n" + JSON.stringify(event, null, 2));
  return context.logStreamName;
};

exports.handler = handler;
`;
}

export const runJavascriptTemplate: TemplateFunction = async (
  projectDir: string,
): Promise<{ entryPoint: string; buildSteps: string[] }> => {
  const srcFolder = resolve(projectDir, "src");
  logger.debug(`Creating src folder at ${projectDir}`);
  mkdirSync(srcFolder, {
    recursive: true,
  });

  const indexFile = resolve(srcFolder, "index.js");
  loggedWriteFile(indexFile, composeIndexFile());

  return {
    entryPoint: relative(projectDir, indexFile),
    buildSteps: [],
  };
};
