import { relative } from "node:path";

import yargs from "yargs/yargs";

import { runCommand } from "./commands";
import { buildCommand } from "./commands/build";
import { deployCommand } from "./commands/deploy";
import { listCommand } from "./commands/ls";
import { getFunctionCommand } from "./commands/read";
import { removeCommand } from "./commands/rm";
import { initializeLemna } from "./init";
import { isEOL } from "./node_version";
import { getRunCommand } from "./npm_client";
import { formatJson } from "./util";
import version from "./version";

/**
 * Parses command line arguments and executes the given command or shows help menu
 */
export async function parseArgs(): Promise<void> {
  await yargs(process.argv.slice(2))
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
          async (client) => {
            console.log(formatJson(await getFunctionCommand(client, argv.name)));
          },
          { requiresCredentials: true },
        );
      },
    )
    .command(
      ["rm [names..]", "remove [names..]", "delete [names..]"],
      "Deletes Lambda functions",
      (yargs) =>
        yargs.positional("names", {
          type: "string",
          description: "Names of functions to delete",
          demandOption: true,
          array: true,
        }),
      async (argv) => {
        await runCommand(async (client) => removeCommand(client, argv.names), {
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
          async (client) => {
            console.log(formatJson(await listCommand(client, argv.take, argv.page)));
          },
          { requiresCredentials: true },
        );
      },
    )
    .command(
      ["init", "setup", "new"],
      "Initializes new project",
      (yargs) => yargs,
      async () => {
        await runCommand(
          async (client) => {
            const { projectDir, npmClient, nodeVersion } = await initializeLemna(client);

            if (isEOL(nodeVersion)) {
              client.logger.warn(
                `You have chosen Node.js version "${nodeVersion}" which has reached its end of life (EOL).`,
              );
              client.logger.warn("See https://endoflife.date/nodejs");
            }

            client.logger.info("Setup successful, run:");
            client.logger.info(`cd ${relative(process.cwd(), projectDir)}`);
            client.logger.info(getRunCommand(npmClient, "deploy"));
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
        const paths = [...new Set(argv.paths)];

        await runCommand(
          async (client) => {
            const { results, matchedCount, successCount } = await buildCommand(client, paths);

            console.log(formatJson({ built: results }));

            if (!matchedCount) {
              client.logger.warn("No files matched the inputs");
            } else {
              client.logger.info(`Successfully built ${successCount}/${matchedCount} functions`);
            }

            if (successCount < matchedCount) {
              client.logger.error("Failed to build some functions");
              process.exit(1);
            }
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
        const paths = [...new Set(argv.paths)];

        await runCommand(
          async (client) => {
            const { matchedCount, successCount } = await deployCommand(client, paths);

            if (!matchedCount) {
              client.logger.warn("No files matched the inputs");
            } else {
              client.logger.info(`Successfully deployed ${successCount}/${matchedCount} functions`);
            }

            if (successCount < matchedCount) {
              client.logger.error("Failed to deploy some functions");
              process.exit(1);
            }
          },
          { requiresCredentials: true },
        );
      },
    )
    .strictCommands()
    .demandCommand(1)
    .parseAsync();
}
