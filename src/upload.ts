import { existsSync, readFileSync, statSync } from "node:fs";

import {
  AddPermissionCommand,
  CreateFunctionCommand,
  CreateFunctionUrlConfigCommand,
  CreateFunctionUrlConfigCommandInput,
  DeleteFunctionUrlConfigCommand,
  GetFunctionCommand,
  GetFunctionConfigurationCommand,
  GetFunctionUrlConfigCommand,
  ResourceConflictException,
  ResourceNotFoundException,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
  UpdateFunctionUrlConfigCommand,
} from "@aws-sdk/client-lambda";

import { FunctionSettings, FunctionUrlSettings } from "./config";
import { Lemna } from "./lemna";
import { formatJson } from "./util";

export class Uploader {
  private _client: Lemna;

  /**
   * Gets builder
   */
  constructor(client: Lemna) {
    this._client = client;
  }

  /**
   * Waits for the function to become ready for another update
   */
  private async waitUntilReady(functionName: string): Promise<void> {
    let delayMs = 1000;

    for (;;) {
      const config = await this._client.lambdaClient.send(
        new GetFunctionConfigurationCommand({
          FunctionName: functionName,
        }),
      );

      if (config.State !== "Pending" && config.LastUpdateStatus !== "InProgress") {
        this._client.logger.silly(`Function state: ${config.State}, ${config.LastUpdateStatus}`);
        this._client.logger.verbose(`Function "${functionName}" is ready for new operation`);
        return;
      }

      // Sleep for some seconds seconds
      this._client.logger.verbose(`Waiting for function "${functionName}" to become ready`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs = Math.min(5000, delayMs + 1000);
    }
  }

  /**
   * Deletes function URL if it exists
   */
  private async tryDeleteFunctionUrl(functionName: string): Promise<boolean> {
    try {
      await this._client.lambdaClient.send(
        new DeleteFunctionUrlConfigCommand({
          FunctionName: functionName,
        }),
      );
      this._client.logger.warn("Deleted function URL because no configuration exists");
      return true;
    } catch (error: unknown) {
      if (error instanceof ResourceNotFoundException) {
        // OK
        return false;
      } else {
        throw error;
      }
    }
  }

  /**
   * Setups up a Lambda function url
   */
  private async createOrUpdateFunctionUrl(
    functionName: string,
    opts: FunctionUrlSettings,
  ): Promise<string> {
    const params: CreateFunctionUrlConfigCommandInput = {
      FunctionName: functionName,
      AuthType: opts.authType === "none" ? "NONE" : "AWS_IAM",
      InvokeMode: opts.invokeMode === "buffered" ? "BUFFERED" : "RESPONSE_STREAM",
      Cors: (() => {
        if (!opts.cors) {
          return undefined;
        }
        if (opts.cors === true) {
          return {
            AllowCredentials: true,
            AllowHeaders: ["*"],
            AllowMethods: ["*"],
            AllowOrigins: ["*"],
            ExposeHeaders: ["*"],
            MaxAge: 3600,
          };
        }
        return {
          AllowCredentials: opts.cors.credentials,
          AllowHeaders: opts.cors.headers,
          AllowMethods: opts.cors.methods,
          AllowOrigins: opts.cors.origins,
          ExposeHeaders: opts.cors.exposeHeaders,
          MaxAge: opts.cors.maxAge,
        };
      })(),
      Qualifier: opts.qualifier,
    };

    try {
      this._client.logger.verbose("Checking if function URL config exists");
      await this._client.lambdaClient.send(
        new GetFunctionUrlConfigCommand({
          FunctionName: functionName,
          Qualifier: opts.qualifier,
        }),
      );

      this._client.logger.verbose(`Updating Lambda function (${functionName}) URL`);
      this._client.logger.silly(params);

      await this._client.lambdaClient.send(new UpdateFunctionUrlConfigCommand(params));
    } catch (error: unknown) {
      if (error instanceof ResourceNotFoundException) {
        this._client.logger.verbose("Function URL config does not exist, creating");
        this._client.logger.silly(params);

        await this._client.lambdaClient.send(new CreateFunctionUrlConfigCommand(params));
      } else {
        throw error;
      }
    }

    if (opts.authType === "none") {
      try {
        this._client.logger.info(
          "Auth type is NONE, adding permission for public URL, as per https://docs.aws.amazon.com/lambda/latest/dg/urls-auth.html#urls-auth-none",
        );

        await this._client.lambdaClient.send(
          new AddPermissionCommand({
            FunctionName: functionName,
            Action: "lambda:InvokeFunctionUrl",
            Principal: "*",
            FunctionUrlAuthType: "NONE",
            StatementId: "FunctionURLAllowPublicAccess",
          }),
        );
      } catch (error) {
        if (error instanceof ResourceConflictException) {
          this._client.logger.verbose("Never mind, it already exists");
        } else {
          throw error;
        }
      }
    }

    const { FunctionUrl } = await this._client.lambdaClient.send(
      new GetFunctionUrlConfigCommand({
        FunctionName: functionName,
      }),
    );

    // NOTE: We just created it so it definitely exists
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return FunctionUrl!;
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

  private async updateFunction(functionSettings: FunctionSettings, zipFile: string): Promise<void> {
    const {
      name: functionName,
      description,
      memorySize,
      handler,
      runtime,
      env,
      timeout,
      layers,
    } = functionSettings;

    // Update function code (with zip)
    this._client.logger.info(`Uploading project ${zipFile} -> ${functionName}`);
    this._client.logger.verbose(`Updating Lambda function (${functionName}) code using ${zipFile}`);
    await this._client.lambdaClient.send(
      new UpdateFunctionCodeCommand({
        FunctionName: functionName,
        ZipFile: readFileSync(zipFile),
      }),
    );

    await this.waitUntilReady(functionName);

    // Update function configuration as well
    this._client.logger.verbose(`Updating Lambda function (${functionName}) configuration`);
    this._client.logger.silly(formatJson(functionSettings));

    this._client.lambdaClient.send(
      new UpdateFunctionConfigurationCommand({
        FunctionName: functionName,
        Description: description,
        MemorySize: memorySize,
        Handler: handler,
        Runtime: runtime,
        Timeout: timeout,
        Environment: {
          Variables: env,
        },
        Layers: layers,
      }),
    );

    await this.waitUntilReady(functionName);

    // Setup function URL and print it
    if (functionSettings.url) {
      const functionUrl = await this.createOrUpdateFunctionUrl(functionName, functionSettings.url);
      this._client.logger.info(`Function URL: ${functionUrl}`);
    } else {
      this.tryDeleteFunctionUrl(functionName);
    }
  }

  private async createFunction(
    functionSettings: FunctionSettings,
    zipFile: string,
    arn: string,
  ): Promise<void> {
    const { name: functionName } = functionSettings;

    await this.createFunctionWithZip(functionSettings, zipFile, arn);
    await this.waitUntilReady(functionName);

    // Setup function URL and print it
    if (functionSettings.url) {
      const functionUrl = await this.createOrUpdateFunctionUrl(functionName, functionSettings.url);
      this._client.logger.info(`Function URL: ${functionUrl}`);
    } else {
      this.tryDeleteFunctionUrl(functionName);
    }
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
      await this.waitUntilReady(functionName);
      await this.updateFunction(functionSettings, zipFile);
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

          // IMPORTANT: Exit early because we're done
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
