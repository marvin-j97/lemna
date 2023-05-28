import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { getConfig, isValidConfig, LemnaConfig, loadConfig } from "../src/config";

const validConfigs: LemnaConfig[] = [
  {
    entryPoint: "entrypoint",
    function: {
      name: "function name",
      runtime: "nodejs16.x",
    },
    buildOptions: { minify: false },
  },
  {
    entryPoint: "entrypoint",
    function: {
      name: "function name",
      runtime: "nodejs16.x",
    },
  },
  {
    entryPoint: "entrypoint",
    function: {
      name: "function name",
      runtime: "nodejs16.x",
    },
    buildOptions: {},
  },
  {
    entryPoint: "entrypoint",
    function: {
      name: "function name",
      runtime: "nodejs18.x",
    },
    buildOptions: {},
  },
];

describe("config", () => {
  validConfigs.forEach((config, i) => {
    it(`should be valid config ${i + 1}`, () => {
      expect(isValidConfig(config)).to.be.true;
    });
  });

  it("should be invalid config", () => {
    expect(isValidConfig({})).to.be.false;
  });

  it("should load config from path", async () => {
    const config = await loadConfig(resolve(__dirname, "config.mjs"));
    expect(config.function.name).to.equal(validConfigs[0].function.name);

    // TODO: change, to not have global state
    const cachedConfig = getConfig();
    expect(config).to.deep.equal(cachedConfig);
  });
});
