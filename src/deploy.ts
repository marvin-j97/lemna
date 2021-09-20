import { build } from "./build";
import { ILemnaConfig } from "./config";
import { updateFunctionCode } from "./upload";

/**
 * Deploys a project
 */
export async function deployProject(config: ILemnaConfig): Promise<void> {
  const { zipFile } = await build(config);
  await updateFunctionCode(config.function, zipFile);
}
