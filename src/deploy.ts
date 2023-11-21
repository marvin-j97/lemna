import { Lemna } from "./lemna";

/**
 * Deploys a project
 */
export async function deployWithConfigPath(
  client: Lemna,
  projectDir: string,
): Promise<void> {
  const { zipFile, config } = await client.buildAtPath(projectDir);
  await client.updateOrCreateFunction(config.function, zipFile);
}
