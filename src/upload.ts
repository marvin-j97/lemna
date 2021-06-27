import aws from "aws-sdk";
import { existsSync, readFileSync, statSync } from "fs";

import { IFunctionSettings } from "./config";
import { logger } from "./logger";

const lambda = new aws.Lambda({
  logger: {
    log: (data) => logger.silly(data),
  },
});

/**
 * Creates a new Lambda function using a zip file
 */
async function createFunctionWithZip(
  functionSettings: IFunctionSettings,
  zipFile: string,
  arn: string,
): Promise<void> {
  const { name, description, memorySize, handler, runtime, env } = functionSettings;

  logger.info(`Uploading project ${zipFile} -> ${name}`);
  logger.verbose(`Creating Lambda function (${name}) code using ${zipFile} and ARN ${arn}`);
  logger.debug(JSON.stringify(functionSettings, null, 2));

  await lambda
    .createFunction({
      FunctionName: name,
      Role: arn,
      Code: {
        ZipFile: readFileSync(zipFile),
      },
      Description: description,
      MemorySize: memorySize,
      Handler: handler,
      Runtime: runtime,
      Environment: env,
    })
    .promise();
}

/**
 * Uploads a zip file to a Lambda function
 */
export async function updateFunctionCode(
  functionSettings: IFunctionSettings,
  zipFile: string,
): Promise<void> {
  if (!existsSync(zipFile) || statSync(zipFile).isDirectory()) {
    logger.error(`${zipFile} not found`);
    process.exit(1);
  }

  const { name, description, memorySize, handler, runtime, env } = functionSettings;

  try {
    await lambda
      .getFunction({
        FunctionName: name,
      })
      .promise();
  } catch (error) {
    const arn = process.env.LEMNA_ARN;

    if (error.statusCode === 404 && arn) {
      logger.info("Function not found, creating");
      await createFunctionWithZip(functionSettings, zipFile, arn);
      return;
    } else {
      if (error.statusCode === 404) {
        logger.warn(`Supply a LEMNA_ARN env variable to automatically create function`);
      }
      logger.error(error.message);
      throw error;
    }
  }

  logger.info(`Uploading project ${zipFile} -> ${name}`);
  logger.verbose(`Updating Lambda function (${name}) code using ${zipFile}`);
  await lambda
    .updateFunctionCode({
      FunctionName: name,
      ZipFile: readFileSync(zipFile),
    })
    .promise();

  logger.verbose(`Updating Lambda function (${name}) configuration`);
  logger.debug(JSON.stringify(functionSettings, null, 2));
  await lambda
    .updateFunctionConfiguration({
      FunctionName: name,
      Description: description,
      MemorySize: memorySize,
      Handler: handler,
      Runtime: runtime,
      Environment: env,
    })
    .promise();
}
