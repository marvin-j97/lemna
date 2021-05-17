import aws from "aws-sdk";
import { existsSync, readFileSync, statSync } from "fs";

import { logger } from "./logger";

const lambda = new aws.Lambda({
  logger: {
    log: (data) => logger.silly(data),
  },
});

/**
 * Uploads a zip file to a Lambda function
 */
export async function updateFunctionCode(functionName: string, zipFile: string): Promise<void> {
  if (!existsSync(zipFile) || statSync(zipFile).isDirectory()) {
    logger.error(`${zipFile} not found`);
    process.exit(1);
  }

  logger.info(`Uploading project ${zipFile} -> ${functionName}`);
  logger.verbose(`Updating Lambda function (${functionName}) code using ${zipFile}`);
  await lambda
    .updateFunctionCode({
      FunctionName: functionName,
      ZipFile: readFileSync(zipFile),
    })
    .promise();
}
