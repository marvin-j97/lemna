import yargs from "yargs";

import { build } from "./build";
import { ILemnaConfig, loadConfig } from "./config";
import { deployProject } from "./deploy";
import { initializeLemna } from "./init";
import { logger } from "./logger";
import { registerModules } from "./register";
import { TemplateType } from "./templates/index";
import version from "./version";

/**
 * Loads config and modules before running a command
 */
function preload(config: string, register: string[]): ILemnaConfig {
  registerModules(register);
  return loadConfig(config);
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
    "init <dir>",
    "Initialize new project",
    (yargs) => {
      return yargs
        .positional("dir", {
          description: "Directory in which to initialize the project",
          type: "string",
        })
        .option({
          template: {
            description: "Template to use",
            choices: Object.values(TemplateType),
            default: TemplateType.Typescript,
          },
          "function-name": {
            alias: ["function"],
            description: "Lambda function name",
            type: "string",
          },
        });
    },
    async (argv) => {
      registerModules(argv.register);

      const functionName = argv["function-name"];
      if (!functionName) {
        logger.error("--function-name required");
        process.exit(1);
      }

      await initializeLemna(<string>argv.dir, functionName, argv.template);
      logger.info("Setup successful");
    },
  )
  .command(
    "build <dir>",
    "Bundles project into .zip file",
    (yargs) => {
      return yargs
        .positional("dir", {
          description: "Config path of project to build",
          type: "string",
        })
        .option({
          format: {
            alias: ["output-format"],
            description: "Output format",
            type: "string",
            default: "raw",
            choices: ["raw", "json"],
          },
          output: {
            description: "Output path of zip",
            type: "string",
          },
        });
    },
    async (argv) => {
      const config = preload(<string>argv.dir, argv.register);

      const { zipFile, buildHash } = await build(config, argv.output);
      logger.info(`Built zip file: ${zipFile}`);

      if (argv.format === "raw") {
        console.log(zipFile);
      } else {
        console.log(JSON.stringify({ buildHash, zipFile }));
      }
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
      logger.silly(`Deploy paths:`);
      logger.silly(JSON.stringify(argv.paths));

      let successCount = 0;

      for (const path of argv.paths) {
        try {
          const config = loadConfig(path);
          await deployProject(config);
          successCount++;
        } catch (error: any) {
          logger.warn(`Error deploying ${path}: ${error.message}`);
        }
      }

      // TODO: if successCount === 0, process.exit(0); else:
      logger.info(`Successfully deployed ${successCount}/${argv.paths.length} functions`);
    },
  )
  .strictCommands()
  .demandCommand(1).argv;
