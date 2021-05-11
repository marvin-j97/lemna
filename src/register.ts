import { logger } from "./logger";

export function registerModules(register: string[]) {
  register.forEach((pkg) => {
    logger.debug(`Registering ${pkg}`);
    require(pkg);
  });
}
