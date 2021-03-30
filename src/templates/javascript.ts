import { mkdirSync } from "fs";
import { relative, resolve } from "path";

import { logger } from "../logger";
import { loggedWriteFile } from "../util";
import { ITemplateResult, TemplateFunction } from "./index";

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
): Promise<ITemplateResult> => {
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
