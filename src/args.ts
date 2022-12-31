import { relative } from "node:path";

import yargs from "yargs";

import { runCommand } from "./commands";
import { buildCommand } from "./commands/build";
import { deployCommand } from "./commands/deploy";
import { listCommand } from "./commands/ls";
import { readFunctionDetails } from "./commands/read";
import { rmCommand } from "./commands/rm";
import { initializeLemna } from "./init";
import logger from "./logger";
import { getRunCommand } from "./npm_client";
import { formatJson } from "./util";
import version from "./version";

export default yargs
  .scriptName("lemna")
  .version(version)
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
