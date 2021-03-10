import aws from "aws-sdk";
import { readFileSync } from "fs";

export async function updateFunctionCode(
  functionName: string,
  zipFile: string,
) {
  const lambda = new aws.Lambda();

  console.log("lambda update function code");
  await lambda
    .updateFunctionCode({
      FunctionName: functionName,
      ZipFile: readFileSync(zipFile),
    })
    .promise();
}
