import yargs from "yargs";

import { build } from "./build";
import { IConfig, loadConfig } from "./config";
import { deployProject } from "./deploy";
import { initializeLemna } from "./init";
import { logger } from "./logger";
import { registerModules } from "./register";
import { TemplateType } from "./templates/index";
// import { updateFunctionCode } from "./upload";
import version from "./version";

/**
 * Loads config and modules before running a command
 */
function preload(config: string, register: string[]): IConfig {
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
    "build",
    "Bundles project into .zip file",
    (yargs) =>
      yargs.option({
        config: {
          alias: ["c", "p", "project"],
          type: "string",
          default: "lemna.config.json",
          description: "Config path",
        },
      }),
    async (argv) => {
      const config = preload(argv.config, argv.register);

      const { zipFile } = await build(config);
      logger.info(`Built zip file: ${zipFile}`);
      console.log({ zipFile });
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
        } catch (error) {
          logger.warn(`Error deploying ${path}: ${error.message}`);
        }
      }

      logger.info(`Successfully deployed ${successCount}/${argv.paths.length} functions`);
    },
  )
  // .command(
  //   "upload <zip>",
  //   "Updates lambda function code using zip file",
  //   (yargs) => {
  //     return yargs
  //       .option({
  //         config: {
  //           alias: ["c", "p", "project"],
  //           type: "string",
  //           default: "lemna.config.json",
  //           description: "Config path",
  //         },
  //       })
  //       .positional("zip", {
  //         description: "Zip file to upload",
  //         type: "string",
  //       });
  //   },
  //   async (argv) => {
  //     const config = preload(argv.config, argv.register);

  //     const { functionName } = config;
  //     await updateFunctionCode(functionName, <string>argv.zip);
  //     logger.info("Upload successful");
  //   },
  // )
  .strictCommands()
  .demandCommand(1).argv;
