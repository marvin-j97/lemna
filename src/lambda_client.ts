import aws from "aws-sdk";

import logger from "./logger";

export const lambdaClient = new aws.Lambda({
  logger: {
    log: (data) => logger.silly(data),
  },
  maxRetries: 5,
});
