import yargs from "yargs";

import { build } from "./build";
import { loadConfig } from "./config";
import { deployProject } from "./deploy";
import { initializeLemna } from "./init";
import { logger } from "./logger";
import { execCommand } from "./npm_client";
import { registerModules } from "./register";
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
    "init <dir>",
    "Initialize new project",
    (yargs) => {
      return yargs.positional("dir", {
        description: "Directory in which to initialize the project",
        type: "string",
      });
    },
    async (argv) => {
      registerModules(argv.register);

      const { npmClient } = await initializeLemna(<string>argv.dir);
      logger.info("Setup successful, run:");
      logger.info(`cd ${argv.dir}`);
      logger.info(execCommand(npmClient, "lemna deploy"));
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
