import { describe, expect, it } from "vitest";

import { globFiles } from "../src/util";

describe("bundle", () => {
  it("should correctly glob files 1", async () => {
    const files = await globFiles(["test/glob_test/*"], process.cwd());
    expect(files.length).to.equal(3);
  });

  it("should correctly glob files 2", async () => {
    const files = await globFiles(["test/glob_test/*.txt"], process.cwd());
    expect(files.length).to.equal(3);
  });
});
