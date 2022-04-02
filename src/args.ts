import { lambdaClient } from "./lambda_client";
import { relative } from "path";
import yargs from "yargs";

import { build } from "./build";
import { loadConfig } from "./config";
import { deployProject } from "./deploy";
import { initializeLemna } from "./init";
import logger from "./logger";
import { execCommand } from "./npm_client";
import { registerModules } from "./register";
import { fileVisitor, formatJson } from "./util";
import version from "./version";

function checkAWSKeys(): void {
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
    "rm <name>",
    "Deletes a Lambda function",
    (yargs) =>
      yargs.positional("name", {
        type: "string",
        description: "Name of function to delete",
        demandOption: true,
      }),
    async (argv) => {
      checkAWSKeys();
      registerModules(argv.register);

      try {
        await lambdaClient
          .deleteFunction({
            FunctionName: argv.name,
          })
          .promise();
        logger.info(`Deleted function: ${argv.name}`);
      } catch (error: any) {
        logger.error(`Error deleting function: ${error.message}`);
        logger.silly(error.stack);
      }
    },
  )
  .command(
    "ls",
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
      checkAWSKeys();
      registerModules(argv.register);

      try {
        let marker: string | undefined;
        let page = 0;

        for (;;) {
          const listResult = await lambdaClient
            .listFunctions({
              MaxItems: Math.floor(argv.take),
              Marker: marker,
            })
            .promise();

          if (page === Math.floor(argv.page)) {
            console.log(listResult.Functions);
            process.exit(0);
          }
          page++;
          marker = listResult.NextMarker;

          if (!listResult.NextMarker) {
            console.log([]);
            process.exit(0);
          }
        }
      } catch (error: any) {
        logger.error(`Error listing functions: ${error.message}`);
        logger.silly(error.stack);
      }
    },
  )
  .command(
    ["init", "setup"],
    "Initialize new project",
    (yargs) => yargs,
    async (argv) => {
      checkAWSKeys();
      registerModules(argv.register);

      try {
        const { projectDir, npmClient } = await initializeLemna();
        logger.info("Setup successful, run:");
        logger.info(`cd ${relative(process.cwd(), projectDir)}`);
        logger.info(execCommand(npmClient, `lemna deploy`));
      } catch (error: any) {
        logger.error(`Error setting up: ${error.message}`);
        logger.silly(error.stack);
      }
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
      registerModules(argv.register);

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
  )
  .command(
    "deploy [paths..]",
    "Builds and deploys one or multiple projects",
    (yargs) => {
      return yargs.positional("paths", {
        description: "Paths of Lemna configs to deploy",
        default: ["lemna.config.json"],
      });
    },
    async (argv) => {
      checkAWSKeys();
      registerModules(argv.register);

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
  )
  .strictCommands()
  .demandCommand(1).argv;
