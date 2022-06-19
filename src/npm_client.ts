export enum NPMClient {
  Npm = "npm",
  Yarn = "yarn",
  Pnpm = "pnpm",
}

const installCommands: Record<string, string> = {
  [NPMClient.Npm]: `npm i`,
  [NPMClient.Pnpm]: `pnpm add`,
  [NPMClient.Yarn]: `yarn add`,
};

const execCommands: Record<string, (client: string) => string> = {
  [NPMClient.Npm]: (cmd) => `npx ${cmd}`,
  [NPMClient.Yarn]: (cmd) => `yarn ${cmd}`,
  [NPMClient.Pnpm]: (cmd) => `pnpm exec ${cmd}`,
};

const runCommands: Record<string, (client: string) => string> = {
  [NPMClient.Npm]: (cmd) => `npm run ${cmd}`,
  [NPMClient.Yarn]: (cmd) => `yarn ${cmd}`,
  [NPMClient.Pnpm]: (cmd) => `pnpm run ${cmd}`,
};

/**
 * Gets the install command of the chosen NPM client
 */
export function getInstallCommand(client: NPMClient): string {
  return installCommands[client];
}

/**
 * Gets the exec command of the chosen NPM client
 */
export function getExecCommand(client: NPMClient, cmd: string): string {
  return execCommands[client](cmd);
}

/**
 * Gets the run command of the chosen NPM client
 */
export function getRunCommand(client: NPMClient, cmd: string): string {
  return runCommands[client](cmd);
}
