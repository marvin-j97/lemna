import { existsSync, readFileSync, statSync } from "node:fs";

import {
  AddPermissionCommand,
  CreateFunctionCommand,
  CreateFunctionUrlConfigCommand,
  type CreateFunctionUrlConfigCommandInput,
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

import type { FunctionSettings, FunctionUrlSettings } from "./config";
import type { Lemna } from "./lemna";
import { formatCors, formatJson } from "./util";

/**
 * Manages function utilities
 */
export class FunctionManager {
  private _client: Lemna;
  private _functionName: string;

  private static WAIT_BASE_DELAY_MS = 250;
  private static WAIT_MAX_TIME = 5_000;

  /**
   * Creates function manager
   */
  constructor(client: Lemna, name: string) {
    this._client = client;
    this._functionName = name;
  }

  /**
   * Creates a new Lambda function using a zip file
   */
  async createFunctionWithZip(
    functionSettings: Omit<FunctionSettings, "name">,
    zipFile: string,
    arn: string,
  ): Promise<void> {
    const { description, memorySize, handler, runtime, env, timeout, tags, layers } =
      functionSettings;

    this._client.logger.info(
      `Creating function "${this._functionName}" with zip file "${zipFile}"`,
    );
    this._client.logger.verbose(`Using function ARN "${arn}"`);
    this._client.logger.silly(formatJson({ functionSettings, zipFile, arn }));

    await this._client.lambdaClient.send(
      new CreateFunctionCommand({
        FunctionName: this._functionName,
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

    if (functionSettings.url) {
      // Setup function URL and print it
      await this.waitUntilReady();

      const functionUrl = await this.ensureUrl(functionSettings.url);
      this._client.logger.info(`Function URL: ${functionUrl}`);
    }

    this._client.logger.info(`Function "${this._functionName}" created`);
  }

  /**
   * Updates function code and configuration
   */
  async updateFunction(
    functionSettings: Omit<FunctionSettings, "name">,
    zipFile: string,
  ): Promise<void> {
    const { description, memorySize, handler, runtime, env, timeout, layers } = functionSettings;

    await this.waitUntilReady();

    // Update function code (with zip)
    this._client.logger.info(`Uploading project ${zipFile} -> ${this._functionName}`);
    this._client.logger.verbose(
      `Updating Lambda function (${this._functionName}) code using ${zipFile}`,
    );
    await this._client.lambdaClient.send(
      new UpdateFunctionCodeCommand({
        FunctionName: this._functionName,
        ZipFile: readFileSync(zipFile),
      }),
    );

    await this.waitUntilReady();

    // Update function configuration as well
    this._client.logger.verbose(`Updating Lambda function (${this._functionName}) configuration`);
    this._client.logger.silly(formatJson(functionSettings));

    this._client.lambdaClient.send(
      new UpdateFunctionConfigurationCommand({
        FunctionName: this._functionName,
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

    // Setup function URL and print it
    if (functionSettings.url) {
      const functionUrl = await this.ensureUrl(functionSettings.url);
      this._client.logger.info(`Function URL: ${functionUrl}`);
    } else {
      this.tryDeleteFunctionUrl();
    }
  }

  /**
   * Setups up or updates a Lambda function url
   *
   * @returns Function URL
   */
  async ensureUrl(opts: FunctionUrlSettings): Promise<string> {
    const params: CreateFunctionUrlConfigCommandInput = {
      FunctionName: this._functionName,
      AuthType: opts.authType === "none" ? "NONE" : "AWS_IAM",
      InvokeMode: opts.invokeMode === "buffered" ? "BUFFERED" : "RESPONSE_STREAM",
      Cors: formatCors(opts.cors),
      Qualifier: opts.qualifier,
    };

    try {
      await this.waitUntilReady();

      this._client.logger.verbose("Checking if function URL config exists");
      await this._client.lambdaClient.send(
        new GetFunctionUrlConfigCommand({
          FunctionName: this._functionName,
          Qualifier: opts.qualifier,
        }),
      );

      this._client.logger.verbose(`Updating Lambda function (${this._functionName}) URL`);
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
        await this.waitUntilReady();

        this._client.logger.verbose(
          "Auth type is NONE, adding permission for public URL, as per https://docs.aws.amazon.com/lambda/latest/dg/urls-auth.html#urls-auth-none",
        );

        await this._client.lambdaClient.send(
          new AddPermissionCommand({
            FunctionName: this._functionName,
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
        FunctionName: this._functionName,
      }),
    );

    // biome-ignore lint/style/noNonNullAssertion: We just created it so it definitely exists
    return FunctionUrl!;
  }

  /**
   * Deletes function URL if it exists
   */
  async tryDeleteFunctionUrl(): Promise<boolean> {
    try {
      await this.waitUntilReady();

      await this._client.lambdaClient.send(
        new DeleteFunctionUrlConfigCommand({
          FunctionName: this._functionName,
        }),
      );
      this._client.logger.warn("Deleted function URL because no configuration exists");
      return true;
    } catch (error: unknown) {
      if (error instanceof ResourceNotFoundException) {
        // OK
        return false;
      }
      throw error;
    }
  }

  /**
   * Waits for the function to become ready for another update
   */
  async waitUntilReady(): Promise<void> {
    let delayMs = FunctionManager.WAIT_BASE_DELAY_MS;

    for (;;) {
      const config = await this._client.lambdaClient.send(
        new GetFunctionConfigurationCommand({
          FunctionName: this._functionName,
        }),
      );

      if (config.State !== "Pending" && config.LastUpdateStatus !== "InProgress") {
        this._client.logger.silly(`Function state: ${config.State}, ${config.LastUpdateStatus}`);
        this._client.logger.verbose(`Function "${this._functionName}" is ready for new operation`);
        return;
      }

      // Sleep for some seconds
      this._client.logger.verbose(`Waiting for function "${this._functionName}" to become ready`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      // Increase delay time, but cap it at max time
      delayMs = Math.min(FunctionManager.WAIT_MAX_TIME, delayMs * 2);

      if (delayMs >= 3_000) {
        this._client.logger.info(`Still waiting for "${this._functionName}" to become ready`);
      }
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
          await this.createFunctionWithZip(functionSettings, zipFile, arn);

          // NOTE: Exit early because we're done
          return;
        }
        this._client.logger.error(
          "Supply config.function.arn or LEMNA_ARN environment variable to automatically create function",
        );
      }

      this._client.logger.error(error);
      throw error;
    }
  }
}
