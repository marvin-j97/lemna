import { build } from "./build";
import { IConfig } from "./config";
import { updateFunctionCode } from "./upload";

/**
 * Deploys a project
 */
export async function deployProject(config: IConfig): Promise<void> {
  const { zipFile } = await build(config);
  await updateFunctionCode(config.functionName, zipFile);
}
