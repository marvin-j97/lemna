import yargs from "yargs";
import { initializeLemna } from "./init";
import { build } from "./build";
import { deployProject } from "./deploy";
import version from "./version";

export default yargs
  .scriptName("lemna")
  .version(version)
  .option({
    config: {
      alias: ["c"],
      type: "string",
      default: "./lemna.config.json",
      description: "Config path",
    },
  })
  .command(
    "init",
    "Initialize new project",
    (yargs) => {
      return yargs.option({
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
          ],
          description: "Folder in which to initialize the project",
          default: ".",
          type: "string",
        },
      });
    },
    async (argv) => {
      const functionName = argv["function-name"];
      if (!functionName) {
        console.error("--function-name required");
        process.exit(1);
      }

      await initializeLemna(argv.path, functionName);
    },
  )
  .command(
    "build",
    "Bundles project into .zip file",
    () => {},
    async (argv) => {
      await build(argv.config);
    },
  )
  .command(
    "deploy",
    "Builds and deploys project",
    () => {},
    async (argv) => {
      await deployProject(argv.config);
    },
  )
  .strictCommands()
  .demandCommand(1).argv;
