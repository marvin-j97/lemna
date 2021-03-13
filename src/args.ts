import yargs from "yargs";
import { initializeLemna } from "./init";
import { build } from "./build";
import { deployProject } from "./deploy";
import version from "./version";
import { loadConfig } from "./config";
import { updateFunctionCode } from "./upload";

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
      const result = await build(loadConfig(argv.config));
      console.log(`Built zip file: ${result.zipFile}`);
    },
  )
  .command(
    "deploy",
    "Builds and deploys project",
    () => {},
    async (argv) => {
      await deployProject(loadConfig(argv.config));
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
      const { functionName } = loadConfig(argv.config);
      await updateFunctionCode(functionName, <string>argv.zip);
      console.error("Deployment successful");
    },
  )
  .strictCommands()
  .demandCommand(1).argv;
