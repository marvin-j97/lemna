import type { Context, SQSEvent } from "aws-lambda";
import { randomUUID } from "crypto";
import { relative } from "path";
import yargs from "yargs";

import { build } from "./build";
import { runCommand } from "./commands";
import { catCommand } from "./commands/cat";
import { lsCommand } from "./commands/ls";
import { rmCommand } from "./commands/rm";
import { loadConfig } from "./config";
import { deployProject } from "./deploy";
import { initializeLemna } from "./init";
import logger from "./logger";
import { getRunCommand } from "./npm_client";
import { fileVisitor, formatJson } from "./util";
import version from "./version";

export default yargs
  .scriptName("lemna")
  .version(version)
  .option({
    register: {
      alias: ["r"],
      type: "array",
      default: [],
      description: "Register node modules",
    },
  })
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
        const config = loadConfig(argv.path);
        const { bundleOutput } = await build(config);
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
          done: () => {},
          fail: () => {},
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
      await runCommand(async () => catCommand(argv.name), {
        modulesToRegister: argv.register,
        requiresCredentials: true,
      });
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
        modulesToRegister: argv.register,
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
      await runCommand(async () => await lsCommand(argv.take, argv.page), {
        modulesToRegister: argv.register,
        requiresCredentials: true,
      });
    },
  )
  .command(
    ["init", "setup"],
    "Initialize new project",
    (yargs) => yargs,
    async (argv) => {
      await runCommand(
        async () => {
          const { projectDir, npmClient } = await initializeLemna();
          logger.info("Setup successful, run:");
          logger.info(`cd ${relative(process.cwd(), projectDir)}`);
          logger.info(getRunCommand(npmClient, "deploy"));
        },
        { modulesToRegister: argv.register, requiresCredentials: false },
      );
    },
  )
  .command(
    "build [paths..]",
    "Builds one or multiple projects",
    (yargs) => {
      return yargs.positional("paths", {
        description: "Paths of Lemna configs to deploy",
        default: ["lemna.config.json"],
      });
    },
    async (argv) => {
      await runCommand(
        async () => {
          logger.silly(`Build paths:`);
          logger.silly(formatJson(argv.paths));

          let successCount = 0;
          let errorCount = 0;
          const results: { built: { zipFile: string; buildHash: string }[] } = {
            built: [],
          };

          for await (const path of fileVisitor(argv.paths)) {
            try {
              const config = loadConfig(path);
              const { zipFile, buildHash } = await build(config);
              logger.verbose(`Built zip file: ${zipFile}`);
              results.built.push({ zipFile, buildHash });
              successCount++;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
              logger.warn(`Error building ${path}: ${error.message}`);
              logger.silly(error.stack);
              errorCount++;
            }
          }

          const matchedCount = successCount + errorCount;
          if (!matchedCount) {
            logger.error("No files matched the inputs");
            process.exit(1);
          }

          console.log(formatJson(results));
          logger.info(
            `Successfully built ${successCount}/${matchedCount} (${(
              (successCount / matchedCount) *
              100
            ).toFixed(0)}%) functions`,
          );
        },
        { modulesToRegister: argv.register, requiresCredentials: false },
      );
    },
  )
  .command(
    ["deploy [paths..]", "up [paths..]"],
    "Builds and deploys one or multiple projects",
    (yargs) => {
      return yargs.positional("paths", {
        description: "Paths of Lemna configs to deploy",
        default: ["lemna.config.json"],
      });
    },
    async (argv) => {
      await runCommand(
        async () => {
          logger.silly(`Deploy paths:`);
          logger.silly(formatJson(argv.paths));

          let successCount = 0;
          let errorCount = 0;

          for await (const path of fileVisitor(argv.paths)) {
            try {
              const config = loadConfig(path);
              await deployProject(config);
              successCount++;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
              logger.warn(`Error deploying ${path}: ${error.message}`);
              logger.silly(error.stack);
              errorCount++;
            }
          }

          const matchedCount = successCount + errorCount;
          if (!matchedCount) {
            logger.error("No files matched the inputs");
            process.exit(1);
          }

          logger.info(
            `Successfully deployed ${successCount}/${matchedCount} (${(
              (successCount / matchedCount) *
              100
            ).toFixed(0)}%) functions`,
          );
        },
        { modulesToRegister: argv.register, requiresCredentials: true },
      );
    },
  )
  .strictCommands()
  .demandCommand(1).argv;
