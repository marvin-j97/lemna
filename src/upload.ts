import aws from "aws-sdk";
import { existsSync, readFileSync, statSync } from "fs";

export async function updateFunctionCode(
  functionName: string,
  zipFile: string,
): Promise<void> {
  if (!existsSync(zipFile) || statSync(zipFile).isDirectory()) {
    console.error(`Zip file not found at ${zipFile}`);
    process.exit(1);
  }

  const lambda = new aws.Lambda();

  console.log(`lambda update function code using ${zipFile}`);
  await lambda
    .updateFunctionCode({
      FunctionName: functionName,
      ZipFile: readFileSync(zipFile),
    })
    .promise();
}
