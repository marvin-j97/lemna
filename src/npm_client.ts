export enum NPMClient {
  Npm = "npm",
  Yarn = "yarn",
  Pnpm = "pnpm",
}

/**
 * Gets the install command of the chosen NPM client
 */
export function installCommand(client: NPMClient): string {
  if (client === NPMClient.Npm) {
    return `${client} i`;
  }
  return `${client} add`;
}

/**
 * Gets the exec command of the chosen NPM client
 */
export function execCommand(client: NPMClient, cmd: string): string {
  if (client === NPMClient.Pnpm) {
    return `pnpm exec ${cmd}`;
  }
  if (client === NPMClient.Yarn) {
    return `yarn ${cmd}`;
  }
  return "npx ${cmd}";
}
