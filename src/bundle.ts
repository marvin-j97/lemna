import commonjs, { RollupCommonJSOptions } from "@rollup/plugin-commonjs";
import json, { RollupJsonOptions } from "@rollup/plugin-json";
import { nodeResolve, RollupNodeResolveOptions } from "@rollup/plugin-node-resolve";
import { rollup, RollupOptions } from "rollup";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { uglify } = require("rollup-plugin-uglify");
import { logger } from "./logger";

export interface ILemnaBundleOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  overridePlugins?: any[];

  rollupOptions?: RollupOptions;
  json?: RollupJsonOptions;
  nodeResolve?: RollupNodeResolveOptions;
  commonjs?: RollupCommonJSOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalPlugins?: any[];
}

/**
 * Bundles code with rollup into a file
 */
export async function bundleCode(
  input: string,
  output: string,
  opts?: ILemnaBundleOptions,
): Promise<void> {
  logger.verbose(`Bundling ${input}`);
  const options = {
    input,
    // aws-sdk is pre-installed on Lambda, so no need to bundle it
    external: ["aws-sdk"],
    plugins: opts?.overridePlugins || [
      json({
        ...opts?.json,
      }),
      commonjs({
        ...opts?.commonjs,
      }),
      nodeResolve({
        ...opts?.nodeResolve,
      }),
      uglify(),
      ...(opts?.additionalPlugins || []),
    ],
    ...opts?.rollupOptions,
  };
  logger.silly(JSON.stringify(options, null, 2));
  const bundle = await rollup(options);

  logger.verbose(`Writing bundle to ${output}`);
  await bundle.write({
    file: output,
    format: "cjs",
  });
}
