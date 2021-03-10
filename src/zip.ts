import { createWriteStream } from "fs";
import jszip from "jszip";

export async function saveZip(zip: jszip, output: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(createWriteStream(output))
      .on("finish", resolve)
      .on("error", reject);
  });
}
