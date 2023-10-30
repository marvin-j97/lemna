import { LambdaClient, type LambdaClientConfig } from "@aws-sdk/client-lambda";

import { Builder, type BuildResult } from "./builder";
import type { Config, FunctionSettings } from "./config";
import { createLemnaLogger, type Logger, type LogLevel } from "./logger";
import { FunctionManager } from "./manager";
import { Uploader } from "./upload";

/**
 * Base class
 */
export class Lemna {
  private _lambdaClient: LambdaClient;
  private _logger: Logger;

  /**
   * Constructs a new instance
   */
  constructor(logger: Logger, lambdaConfig?: LambdaClientConfig) {
    this._lambdaClient = new LambdaClient(lambdaConfig ?? {});
    this._logger = logger;
  }

  static withLogLevel(logLevel: LogLevel, lambdaConfig?: LambdaClientConfig): Lemna {
    return new Lemna(createLemnaLogger(logLevel), lambdaConfig);
  }

  /**
   * Returns Lambda instance
   */
  get lambdaClient(): LambdaClient {
    return this._lambdaClient;
  }

  /**
   * Returns logger instance
   */
  get logger(): Logger {
    return this._logger;
  }

  /**
   * Builds a project according with the config given at path
   *
   * @returns Build result and config
   */
  buildAtPath(configPath: string): Promise<BuildResult & { config: Config }> {
    return new Builder(this).run(configPath);
  }

  /**
   * Builds a project according with the config given at path
   *
   * @returns Build result and config
   */
  updateOrCreateFunction(functionSettings: FunctionSettings, zipFile: string): Promise<void> {
    const fm = new FunctionManager(this, functionSettings.name);
    return new Uploader(this, fm).updateOrCreateFunction(functionSettings, zipFile);
  }
}
