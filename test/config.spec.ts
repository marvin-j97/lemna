import test from "ava";
import { resolve } from "path";

import { getConfig, ILemnaConfig, isValidConfig, loadConfig } from "../src/config";

const validConfigs: ILemnaConfig[] = [
  {
    entryPoint: "entrypoint",
    function: {
      name: "function name",
      runtime: "nodejs14.x",
    },
    buildOptions: { minify: false },
  },
  {
    entryPoint: "entrypoint",
    function: {
      name: "function name",
      runtime: "nodejs14.x",
    },
  },
];

let i = 0;
for (const config of validConfigs) {
  test(`Is valid config ${i}`, (t) => {
    t.assert(isValidConfig(config));
  });
  i++;
}

test("Is invalid config", (t) => {
  t.false(isValidConfig({}));
});

test("Load config from path", (t) => {
  const config = loadConfig(resolve(__dirname, "config.function.js"));
  t.deepEqual(config.function.name, validConfigs[0].function.name);

  const cachedConfig = getConfig();
  t.deepEqual(config, cachedConfig);
});
