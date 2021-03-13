import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { rollup } from "rollup";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { uglify } = require("rollup-plugin-uglify");

export async function bundleCode(input: string, output: string): Promise<void> {
  console.error("rollup");
  const bundle = await rollup({
    input,
    plugins: [json(), nodeResolve(), commonjs(), uglify()],
  });
  console.error("rollup write");
  await bundle.write({
    file: output,
    format: "cjs",
  });
}
