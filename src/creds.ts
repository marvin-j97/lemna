import logger from "./logger";

/**
 * Checks for required AWS keys, exits if any is not found
 */
export function checkAWSKeys(): void {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    logger.error(`Missing AWS_ACCESS_KEY_ID environment variable`);
    process.exit(1);
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    logger.error(`Missing AWS_SECRET_ACCESS_KEY environment variable`);
    process.exit(1);
  }
  if (!process.env.AWS_REGION) {
    logger.error(`Missing AWS_REGION environment variable`);
    process.exit(1);
  }
}
