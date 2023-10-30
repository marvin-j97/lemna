import { readFileSync } from "node:fs";

import {
  AddPermissionCommand,
  CreateFunctionUrlConfigCommand,
  type CreateFunctionUrlConfigCommandInput,
  DeleteFunctionUrlConfigCommand,
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

export class FunctionManager {
  private _client: Lemna;
  private _functionName: string;

  private static WAIT_BASE_DELAY_MS = 250;
  private static WAIT_MAX_TIME = 5_000;

  constructor(client: Lemna, name: string) {
    this._client = client;
    this._functionName = name;
  }

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

    // NOTE: We just created it so it definitely exists
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
      } else {
        throw error;
      }
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

      if (delayMs >= 2_000) {
        this._client.logger.info(`Still waiting for "${this._functionName}" to become ready`);
      }
    }
  }
}
