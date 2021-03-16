import { build } from "./build";
import { IConfig } from "./config";
import { updateFunctionCode } from "./upload";

export async function deployProject(config: IConfig): Promise<void> {
  const { zipFile } = await build(config);
  await updateFunctionCode(config.functionName, zipFile);
}
