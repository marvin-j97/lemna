import { build } from "./build";
import { getConfig } from "./config";
import { updateFunctionCode } from "./upload";

export async function deployProject(configPath: string): Promise<void> {
  const { zipFile } = await build(configPath);
  const config = getConfig();

  await updateFunctionCode(config.functionName, zipFile);

  console.error("Deployment successful");
}
