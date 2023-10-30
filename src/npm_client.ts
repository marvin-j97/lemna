export type NPMClient = "npm" | "yarn" | "pnpm";

const installCommands: Record<NPMClient, string> = {
  npm: `npm i`,
  pnpm: `pnpm add`,
  yarn: `yarn add`,
};

const execCommands: Record<string, (client: string) => string> = {
  npm: (cmd) => `npx ${cmd}`,
  yarn: (cmd) => `yarn ${cmd}`,
  pnpm: (cmd) => `pnpx ${cmd}`,
};

const runCommands: Record<string, (client: string) => string> = {
  npm: (cmd) => `npm run ${cmd}`,
  yarn: (cmd) => `yarn ${cmd}`,
  pnpm: (cmd) => `pnpm run ${cmd}`,
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
