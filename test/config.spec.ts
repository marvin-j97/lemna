import test from "ava";
import { resolve } from "path";
import { getConfig, IConfig, isValidConfig, loadConfig } from "../src/config";

const validConfig: IConfig = {
  functionName: "function",
  entryPoint: "entrypoint",
  buildSteps: undefined,
  bundle: undefined,
};

test("Is valid config", (t) => {
  t.assert(isValidConfig(validConfig));
});

test("Is invalid config", (t) => {
  t.false(isValidConfig({}));
});

test("Load config from path", (t) => {
  const config = loadConfig(resolve(__dirname, "config.function.js"));
  t.deepEqual(config.functionName, validConfig.functionName);

  const cachedConfig = getConfig();
  t.deepEqual(config, cachedConfig);
});
