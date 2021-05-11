import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { rollup } from "rollup";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { uglify } = require("rollup-plugin-uglify");
import { logger } from "./logger";

/**
 * Bundles code with rollup into a file
 */
export async function bundleCode(input: string, output: string): Promise<void> {
  logger.verbose(`Bundling ${input}`);
  const bundle = await rollup({
    input,
    plugins: [json(), nodeResolve(), commonjs(), uglify()],
  });
  logger.verbose(`Writing bundle to ${output}`);
  await bundle.write({
    file: output,
    format: "cjs",
  });
}
