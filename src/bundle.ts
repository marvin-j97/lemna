import * as esbuild from "esbuild";

import { logger } from "./logger";

interface IBundleOptions {
  minify: boolean;
}

/**
 * Bundles code with esbuild into a file
 */
export async function bundleCode(
  input: string,
  output: string,
  opts: IBundleOptions,
): Promise<void> {
  logger.verbose(`Bundling ${input}`);

  const options: esbuild.BuildOptions = {
    entryPoints: [input],
    // aws-sdk is pre-installed on Lambda, so no need to bundle it
    external: ["aws-sdk"],
    bundle: true,
    outfile: output,
    format: "cjs",
    platform: "node",
    minify: opts.minify || false,
  };

  logger.silly(JSON.stringify(options, null, 2));
  logger.verbose(`Writing bundle to ${output}`);

  const bundle = await esbuild.build(options);

  logger.silly(JSON.stringify(bundle, null, 2));
}
