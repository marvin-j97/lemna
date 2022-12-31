import { randomUUID } from "node:crypto";
import { relative } from "node:path";

import type { Context, SQSEvent } from "aws-lambda";
import yargs from "yargs";

import { build } from "./build";
import { runCommand } from "./commands";
import { buildCommand } from "./commands/build";
import { deployCommand } from "./commands/deploy";
import { listCommand } from "./commands/ls";
import { readFunctionDetails } from "./commands/read";
import { rmCommand } from "./commands/rm";
import { loadConfig } from "./config";
import { initializeLemna } from "./init";
import logger from "./logger";
import { getRunCommand } from "./npm_client";
import { formatJson } from "./util";
import version from "./version";

export default yargs
  .scriptName("lemna")
  .version(version)
  .command(
    "run [path]",
    "Run Lambda function with a specific payload",
    (yargs) =>
      yargs.positional("path", {
        description: "Path of Lemna config to run",
        default: "lemna.config.json",
        demandOption: false,
      }),
    async (argv) => {
      try {
        const config = await loadConfig(argv.path);
        const { bundleOutput } = await build(config);

        // TODO: don't use require, use esbuild
        const { handler } = require(bundleOutput);
        if (!handler) {
          logger.error("Invalid Lambda function: no handler function");
          process.exit(1);
        }

        const event: SQSEvent = {
          Records: [
            {
              messageId: "19dd0b57-b21e-4ac1-bd88-01bbb068cb78",
              receiptHandle: "MessageReceiptHandle",
              body: "Hello from SQS!",
              attributes: {
                ApproximateReceiveCount: "1",
                SentTimestamp: "1523232000000",
                SenderId: "123456789012",
                ApproximateFirstReceiveTimestamp: "1523232000001",
              },
              messageAttributes: {},
              md5OfBody: "{{{md5_of_body}}}",
              eventSource: "aws:sqs",
              eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:MyQueue",
              awsRegion: "us-east-1",
            },
          ],
        };

        const context: Context = {
          functionName: config.function.name,
          functionVersion: "1",
          awsRequestId: randomUUID(),
          logGroupName: randomUUID(),
          callbackWaitsForEmptyEventLoop: true,
          getRemainingTimeInMillis: () => 500,
          invokedFunctionArn:
            config.function.arn ||
            `arn:aws:lambda:eu-central-1:123456789012:function:${config.function.name}`,
          logStreamName: randomUUID(),
          memoryLimitInMB: String(config.function.memorySize || 128),
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          done: () => {},
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          fail: () => {},
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          succeed: () => {},
        };

        console.log(await handler(event, context));
      } catch (error: any) {
        logger.error(`Error running Lambda: ${error.message}`);
        process.exit(1);
      }
    },
  )
  .command(
    ["cat <name>", "show <name>"],
    "Shows Lambda function details",
    (yargs) =>
      yargs.positional("name", {
        type: "string",
        description: "Name of function to delete",
        demandOption: true,
      }),
    async (argv) => {
      await runCommand(
        async () => {
          console.log(formatJson(await readFunctionDetails(argv.name)));
        },
        { requiresCredentials: true },
      );
    },
  )
  .command(
    ["rm <name>", "remove <name>", "delete <name>"],
    "Deletes a Lambda function",
    (yargs) =>
      yargs.positional("name", {
        type: "string",
        description: "Name of function to delete",
        demandOption: true,
      }),
    async (argv) => {
      await runCommand(async () => rmCommand(argv.name), {
        requiresCredentials: true,
      });
    },
  )
  .command(
    ["ls", "list"],
    "Lists functions in account",
    (yargs) =>
      yargs.option({
        page: {
          description: "Page to display (zero-indexed)",
          default: 0,
          type: "number",
        },
        take: {
          description: "Page size",
          default: 50,
          type: "number",
        },
      }),
    async (argv) => {
      await runCommand(
        async () => {
          console.log(formatJson(await listCommand(argv.take, argv.page)));
        },
        { requiresCredentials: true },
      );
    },
  )
  .command(
    ["init", "setup"],
    "Initializes new project",
    (yargs) => yargs,
    async () => {
      await runCommand(
        async () => {
          const { projectDir, npmClient } = await initializeLemna();
          logger.info("Setup successful, run:");
          logger.info(`cd ${relative(process.cwd(), projectDir)}`);
          logger.info(getRunCommand(npmClient, "deploy"));
        },
        { requiresCredentials: false },
      );
    },
  )
  .command(
    "build [paths..]",
    "Builds one or multiple projects",
    (yargs) => {
      return yargs.positional("paths", {
        description: "Paths of Lemna configs to deploy",
        default: ["lemna.config.mjs"],
      });
    },
    async (argv) => {
      await runCommand(
        async () => {
          const { results, matchedCount, successCount } = await buildCommand(argv.paths);
          console.log(formatJson({ built: results }));
          logger.info(
            `Successfully built ${successCount}/${matchedCount} (${(
              (successCount / matchedCount) *
              100
            ).toFixed(0)}%) functions`,
          );
        },
        { requiresCredentials: false },
      );
    },
  )
  .command(
    ["deploy [paths..]", "up [paths..]"],
    "Builds and deploys one or multiple projects",
    (yargs) => {
      return yargs.positional("paths", {
        description: "Paths of Lemna configs to deploy",
        default: ["lemna.config.mjs"],
      });
    },
    async (argv) => {
      await runCommand(
        async () => {
          const { matchedCount, successCount } = await deployCommand(argv.paths);
          logger.info(
            `Successfully deployed ${successCount}/${matchedCount} (${(
              (successCount / matchedCount) *
              100
            ).toFixed(0)}%) functions`,
          );
        },
        { requiresCredentials: true },
      );
    },
  )
  .strictCommands()
  .demandCommand(1).argv;
