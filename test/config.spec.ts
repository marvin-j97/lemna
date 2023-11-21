import { describe, expect, it } from "vitest";

import { Config, isValidConfig } from "../src/config";
import { createLemnaLogger } from "../src/logger";

const validConfigs: Config[] = [
  {
    entryPoint: "entrypoint",
    function: {
      name: "function name",
      runtime: "nodejs16.x",
      moduleFormat: "esm",
    },
    esbuild: { minify: false },
  },
  {
    entryPoint: "entrypoint",
    function: {
      name: "function name",
      runtime: "nodejs16.x",
      moduleFormat: "esm",
    },
  },
  {
    entryPoint: "entrypoint",
    function: {
      name: "function name",
      runtime: "nodejs16.x",
      moduleFormat: "esm",
    },
    esbuild: { minify: true },
  },
  {
    entryPoint: "entrypoint",
    function: {
      name: "function name",
      runtime: "nodejs18.x",
      moduleFormat: "cjs",
    },
    esbuild: {},
  },
];

const logger = createLemnaLogger("silly");

describe("config", () => {
  validConfigs.forEach((config, i) => {
    it(`should be valid config ${i + 1}`, () => {
      expect(isValidConfig(config, logger)).to.be.true;
    });
  });

  it("should be invalid config", () => {
    expect(isValidConfig({}, logger)).to.be.false;
  });

  /* TODO: dynamic import in vite?? 
    https://www.npmjs.com/package/vite-plugin-dynamic-import
  */
  /* it("should load config from path", async () => {
    const config = await loadConfig(resolve(__dirname, "fixture", "config.mjs"));
    expect(config.function.name).to.equal(validConfigs[0].function.name);
  }); */
});
