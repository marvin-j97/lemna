import yargs from "yargs";

import { build } from "./build";
import { IConfig, loadConfig } from "./config";
import { deployProject } from "./deploy";
import { initializeLemna } from "./init";
import { logger } from "./logger";
import { registerModules } from "./register";
import { TemplateType } from "./templates/index";
import { updateFunctionCode } from "./upload";
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
    config: {
      alias: ["c", "p", "project"],
      type: "string",
      default: "lemna.config.json",
      description: "Config path",
    },
    register: {
      alias: ["r"],
      type: "array",
      default: [],
      description: "Register node modules",
    },
  })
  .command(
    "init",
    "Initialize new project",
    (yargs) => {
      return yargs.option({
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
        path: {
          alias: [
            "dir",
            "directory",
            "working-dir",
            "working-directory",
            "project-dir",
            "project-directory",
            "folder",
          ],
          description: "Folder in which to initialize the project",
          default: ".",
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

      await initializeLemna(argv.path, functionName, argv.template);
      logger.info("Setup successful");
    },
  )
  .command(
    "build",
    "Bundles project into .zip file",
    (yargs) => yargs,
    async (argv) => {
      const config = preload(argv.config, argv.register);

      const { zipFile } = await build(config);
      logger.info(`Built zip file: ${zipFile}`);
      console.log({ zipFile });
    },
  )
  .command(
    "deploy",
    "Builds and deploys project",
    (yargs) => yargs,
    async (argv) => {
      const config = preload(argv.config, argv.register);

      await deployProject(config);
      logger.info("Deployment successful");
    },
  )
  .command(
    "upload <zip>",
    "Updates lambda function code using zip file",
    (yargs) => {
      return yargs.positional("zip", {
        description: "Zip file to upload",
        type: "string",
      });
    },
    async (argv) => {
      const config = preload(argv.config, argv.register);

      const { functionName } = config;
      await updateFunctionCode(functionName, <string>argv.zip);
      logger.info("Upload successful");
    },
  )
  .strictCommands()
  .demandCommand(1).argv;
