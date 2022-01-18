export enum NPMClient {
  Npm = "npm",
  Yarn = "yarn",
  Pnpm = "pnpm",
}

export function installCommand(client: NPMClient): string {
  if (client === NPMClient.Npm) {
    return `${client} i`;
  }
  return `${client} add`;
}

export function execCommand(client: NPMClient, cmd: string): string {
  if (client === NPMClient.Pnpm) {
    return `pnpm exec ${cmd}`;
  }
  if (client === NPMClient.Yarn) {
    return `yarn ${cmd}`;
  }
  return "npx ${cmd}";
}
