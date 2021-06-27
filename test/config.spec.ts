import test from "ava";
import { resolve } from "path";
import { getConfig, IConfig, isValidConfig, loadConfig } from "../src/config";

const validConfig: IConfig = {
  entryPoint: "entrypoint",
  buildSteps: undefined,
  bundle: undefined,
  function: {
    name: "function name",
    runtime: "nodejs14.x",
    handler: undefined,
    description: undefined,
    memorySize: undefined,
    env: undefined,
  },
};

test("Is valid config", (t) => {
  t.assert(isValidConfig(validConfig));
});

test("Is invalid config", (t) => {
  t.false(isValidConfig({}));
});

test("Load config from path", (t) => {
  const config = loadConfig(resolve(__dirname, "config.function.js"));
  t.deepEqual(config.function.name, validConfig.function.name);

  const cachedConfig = getConfig();
  t.deepEqual(config, cachedConfig);
});
