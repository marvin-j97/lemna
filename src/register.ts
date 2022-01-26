import logger from "./logger";

/**
 * Registers node modules
 */
export function registerModules(register: string[]): void {
  register.forEach((pkg) => {
    logger.debug(`Registering ${pkg}`);
    require(pkg);
  });
}
