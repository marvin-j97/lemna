import aws from "aws-sdk";
import { existsSync, readFileSync, statSync } from "fs";

import { logger } from "./logger";

export async function updateFunctionCode(functionName: string, zipFile: string): Promise<void> {
  if (!existsSync(zipFile) || statSync(zipFile).isDirectory()) {
    logger.error(`${zipFile} not found`);
    process.exit(1);
  }

  logger.info(`Uploading project`);
  logger.verbose(`Updating Lambda function (${functionName}) code using ${zipFile}`);
  await new aws.Lambda()
    .updateFunctionCode({
      FunctionName: functionName,
      ZipFile: readFileSync(zipFile),
    })
    .promise();
}
