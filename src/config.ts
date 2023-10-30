import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

import * as z from "zod";

import type { Logger } from "./logger";
import { formatJson } from "./util";
import { pathToFileURL } from "node:url";
import type { BuildOptions } from "esbuild";

const runtimeSchema = z.enum(["nodejs16.x", "nodejs18.x"]);
const moduleFormatSchema = z.enum(["cjs", "esm"]);

const functionUrlAuthTypeSchema = z.enum(["none", "iam"]);
const functionUrlInvokeModeSchema = z.enum(["buffered", "stream"]);

const functionUrlCorsSettingsSchema = z
  .object({
    credentials: z.boolean().optional(),
    headers: z.array(z.string().min(1)).optional(),
    exposeHeaders: z.array(z.string().min(1)).optional(),
    methods: z.array(z.string().min(1)).optional(),
    origins: z.array(z.string().min(1)),
    maxAge: z.number().positive().int().optional(),
  })
  .strict();

const functionUrlSettingsSchema = z
  .object({
    authType: functionUrlAuthTypeSchema,
    invokeMode: functionUrlInvokeModeSchema,
    cors: z.union([functionUrlCorsSettingsSchema, z.literal(true)]).optional(),
    qualifier: z.string().optional(),
  })
  .strict();

const functionSettingsSchema = z
  .object({
    arn: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    memorySize: z.number().int().min(1).optional(),
    handler: z.string().optional(),
    runtime: runtimeSchema,
    moduleFormat: moduleFormatSchema,
    env: z.record(z.string()).optional(),
    tags: z.record(z.string()).optional(),
    timeout: z.number().optional(),
    layers: z.array(z.string().min(1)).optional(),
    url: functionUrlSettingsSchema.optional(),
  })
  .strict();

export type FunctionSettings = z.TypeOf<typeof functionSettingsSchema>;
export type FunctionUrlSettings = z.TypeOf<typeof functionUrlSettingsSchema>;
export type RuntimeVersion = z.TypeOf<typeof runtimeSchema>;
export type ModuleFormat = z.TypeOf<typeof moduleFormatSchema>;
export type InvokeMode = z.TypeOf<typeof functionUrlInvokeModeSchema>;

const configSchema = z
  .object({
    entryPoint: z.string().min(1),
    output: z.string().min(1).optional(),
    includeFiles: z.record(z.array(z.string().min(1))).optional(),
    buildSteps: z.array(z.string().min(1)).optional(),
    function: functionSettingsSchema,
    esbuild: z.object({}).optional(),
  })
  .strict();

export type Config = Omit<z.TypeOf<typeof configSchema>, "esbuild"> & {
  esbuild: Omit<BuildOptions, "entryPoints" | "outfile" | "banner">;
};

/**
 * Returns if the given input is a valid Lemna config
 */
export function isValidConfig(val: unknown, logger: Logger): val is Config {
  const result = configSchema.safeParse(val);
  if (result.success) {
    return true;
  }

  logger.error(
    `${result.error.issues.length} validation errors: ${formatJson(result.error.issues)}`,
  );
  return false;
}

/**
 * Loads a config from file (.mjs)
 */
export async function loadConfig(file: string, logger: Logger): Promise<Config> {
  const path = resolve(file);
  logger.debug(`Loading config at ${path}`);

  if (!existsSync(path)) {
    logger.error(`Config not found at ${path}`);
    throw new Error(`Config not found at ${path}`);
  }

  if (statSync(path).isDirectory()) {
    logger.error(`${path} is a directory`);
    throw new Error(`${path} is a directory`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let content: any = await import(pathToFileURL(path).toString());

  if (content.default) {
    content = content.default;
  }
  if (typeof content === "function") {
    content = content();
  }

  logger.silly("Loaded config:");
  logger.silly(formatJson(content));

  if (!isValidConfig(content, logger)) {
    logger.error(`Invalid config at ${path}`);
    process.exit(1);
  }

  return content as Config;
}
