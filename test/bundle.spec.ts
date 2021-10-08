import test from "ava";

import { globFiles } from "../src/util";

test("Should correctly glob files 1", async (t) => {
  const files = await globFiles(["test/glob_test/*"], process.cwd());
  t.is(files.length, 3);
});

test("Should correctly glob files 2", async (t) => {
  const files = await globFiles(["test/glob_test/*.txt"], process.cwd());
  t.is(files.length, 3);
});
