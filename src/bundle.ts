import commonjs, { RollupCommonJSOptions } from "@rollup/plugin-commonjs";
import json, { RollupJsonOptions } from "@rollup/plugin-json";
import { nodeResolve, RollupNodeResolveOptions } from "@rollup/plugin-node-resolve";
import { rollup, RollupOptions } from "rollup";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { uglify } = require("rollup-plugin-uglify");
import { logger } from "./logger";

export interface ILemnaBundleOptions {
  overridePlugins?: any[];

  rollupOptions?: RollupOptions;
  json?: RollupJsonOptions;
  nodeResolve?: RollupNodeResolveOptions;
  commonjs?: RollupCommonJSOptions;
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
  const bundle = await rollup({
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
  });
  logger.verbose(`Writing bundle to ${output}`);
  await bundle.write({
    file: output,
    format: "cjs",
  });
}
