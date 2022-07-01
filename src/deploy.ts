import { build } from "./build";
import { LemnaConfig } from "./config";
import { updateFunctionCode } from "./upload";

/**
 * Deploys a project
 */
export async function deployProject(config: LemnaConfig): Promise<void> {
  const { zipFile } = await build(config);
  await updateFunctionCode(config.function, zipFile);
}
