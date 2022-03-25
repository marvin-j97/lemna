import * as esbuild from "esbuild";

import logger from "./logger";
import { formatJson } from "./util";

/**
 * Bundles code with esbuild into a file
 */
export async function bundleCode(
  input: string,
  output: string,
  opts: Partial<esbuild.BuildOptions>,
): Promise<void> {
  logger.verbose(`Bundling ${input}`);

  const options: esbuild.BuildOptions = {
    // aws-sdk is pre-installed on Lambda, so no need to bundle it
    external: ["aws-sdk"],
    bundle: true,
    format: "cjs",
    platform: "node",
    ...opts,
    entryPoints: [input],
    outfile: output,
  };

  logger.silly(formatJson(options));
  logger.verbose(`Writing bundle to ${output}`);

  const bundle = await esbuild.build(options);

  logger.silly(formatJson(bundle));

  if (bundle.warnings.length) {
    logger.warn(formatJson(bundle.warnings));
  }

  const errorCount = bundle.errors.length;
  if (errorCount) {
    throw new Error(`Had ${errorCount} bundle errors`);
  }
}
