import test from "ava";
import { IConfig, isValidConfig } from "../src/config";

test("Is valid config", (t) => {
  const config: IConfig = {
    functionName: "function",
    entryPoint: "entrypoint",
    buildSteps: undefined,
    bundle: undefined,
  };
  t.assert(isValidConfig(config));
});

test("Is invalid config", (t) => {
  t.assert(isValidConfig({}));
});
