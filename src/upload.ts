import { existsSync, readFileSync, statSync } from "fs";

import { IFunctionSettings } from "./config";
import { lambdaClient } from "./lambda_client";
import logger from "./logger";
import { formatJson } from "./util";

/**
 * Creates a new Lambda function using a zip file
 */
async function createFunctionWithZip(
  functionSettings: IFunctionSettings,
  zipFile: string,
  arn: string,
): Promise<void> {
  const { name, description, memorySize, handler, runtime, env, timeout, tags } = functionSettings;

  logger.info(`Uploading project ${zipFile} -> ${name}`);
  logger.verbose(`Creating Lambda function (${name}) code using ${zipFile} and ARN ${arn}`);
  logger.debug(formatJson(functionSettings));

  await lambdaClient
    .createFunction({
      FunctionName: name,
      Role: arn,
      Code: { ZipFile: readFileSync(zipFile) },
      Description: description,
      MemorySize: memorySize,
      Handler: handler,
      Runtime: runtime,
      Timeout: timeout,
      Environment: { Variables: env },
      Tags: tags,
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

  const {
    arn: configARN,
    name,
    description,
    memorySize,
    handler,
    runtime,
    env,
    timeout,
  } = functionSettings;

  try {
    await lambdaClient.getFunction({ FunctionName: name }).promise();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const arn = configARN || process.env.LEMNA_ARN;

    if (error.statusCode === 404 && arn) {
      logger.info("Function not found, creating");
      await createFunctionWithZip(functionSettings, zipFile, arn);
      return;
    } else {
      if (error.statusCode === 404) {
        logger.error(
          `Supply config.function.arn or LEMNA_ARN environment variable to automatically create function`,
        );
      }
      logger.error(error.message);
      throw error;
    }
  }

  logger.info(`Uploading project ${zipFile} -> ${name}`);
  logger.verbose(`Updating Lambda function (${name}) code using ${zipFile}`);
  await lambdaClient
    .updateFunctionCode({ FunctionName: name, ZipFile: readFileSync(zipFile) })
    .promise();

  logger.verbose(`Updating Lambda function (${name}) configuration`);
  logger.debug(formatJson(functionSettings));
  await lambdaClient
    .updateFunctionConfiguration({
      FunctionName: name,
      Description: description,
      MemorySize: memorySize,
      Handler: handler,
      Runtime: runtime,
      Timeout: timeout,
      Environment: {
        Variables: env,
      },
    })
    .promise();
}
