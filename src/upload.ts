import { existsSync, readFileSync, statSync } from "node:fs";

import {
  CreateFunctionCommand,
  GetFunctionCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-lambda";

import type { FunctionSettings } from "./config";
import { Lemna } from "./lemna";
import type { FunctionManager } from "./manager";
import { formatJson } from "./util";

/**
 * Uploader class
 */
export class Uploader {
  private _client: Lemna;
  private _fm: FunctionManager;

  /**
   * Gets builder
   */
  constructor(client: Lemna, fm: FunctionManager) {
    this._client = client;
    this._fm = fm;
  }

  /**
   * Creates a new Lambda function using a zip file
   */
  private async createFunctionWithZip(
    functionSettings: FunctionSettings,
    zipFile: string,
    arn: string,
  ): Promise<void> {
    const {
      name: functionName,
      description,
      memorySize,
      handler,
      runtime,
      env,
      timeout,
      tags,
      layers,
    } = functionSettings;

    this._client.logger.info(`Creating function "${functionName}" with zip file "${zipFile}"`);
    this._client.logger.verbose(`Using function ARN "${arn}"`);
    this._client.logger.silly(formatJson({ functionSettings, zipFile, arn }));

    await this._client.lambdaClient.send(
      new CreateFunctionCommand({
        FunctionName: functionName,
        Role: arn,
        Code: { ZipFile: readFileSync(zipFile) },
        Description: description,
        MemorySize: memorySize,
        Handler: handler,
        Runtime: runtime,
        Timeout: timeout,
        Environment: {
          Variables: env,
        },
        Tags: tags,
        Layers: layers,
      }),
    );
  }

  private async createFunction(
    functionSettings: FunctionSettings,
    zipFile: string,
    arn: string,
  ): Promise<void> {
    await this.createFunctionWithZip(functionSettings, zipFile, arn);

    if (functionSettings.url) {
      // Setup function URL and print it
      const functionUrl = await this._fm.ensureUrl(functionSettings.url);
      this._client.logger.info(`Function URL: ${functionUrl}`);
    }

    this._client.logger.info(`Function "${functionSettings.name}" created`);
  }

  /**
   * Uploads a zip file to a Lambda function
   */
  async updateOrCreateFunction(functionSettings: FunctionSettings, zipFile: string): Promise<void> {
    if (!existsSync(zipFile) || statSync(zipFile).isDirectory()) {
      this._client.logger.error(`${zipFile} not found`);
      throw new Error("Zip file not found");
    }

    const { arn: configARN, name: functionName } = functionSettings;

    try {
      // Check if function exists
      // If no: jumps to catch and handle 404 case
      // I really hate try-catch statements
      this._client.logger.verbose("Checking if function actually exists");
      await this._client.lambdaClient.send(
        new GetFunctionCommand({
          FunctionName: functionName,
        }),
      );

      // The function does exist, update its code with the zip file
      await this._fm.updateFunction(functionSettings, zipFile);
    } catch (error: unknown) {
      const arn = configARN || process.env.LEMNA_ARN;

      // Function does not exist
      // Check for ARN, if it exists
      // create the function and exit early, otherwise, error
      if (error instanceof ResourceNotFoundException) {
        this._client.logger.info("Function not found");

        if (arn) {
          this._client.logger.info("ARN supplied, creating function");
          await this.createFunction(functionSettings, zipFile, arn);

          // NOTE: Exit early because we're done
          return;
        } else {
          this._client.logger.error(
            "Supply config.function.arn or LEMNA_ARN environment variable to automatically create function",
          );
        }
      }

      this._client.logger.error(error);
      throw error;
    }
  }
}
