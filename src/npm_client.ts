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

/**
 * Gets the install command of the chosen NPM client
 */
export function installCommand(client: NPMClient): string {
  return installCommands[client];
}

/**
 * Gets the exec command of the chosen NPM client
 */
export function execCommand(client: NPMClient, cmd: string): string {
  return execCommands[client](cmd);
}
