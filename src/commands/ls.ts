import { lambdaClient } from "../lambda_client";
import { formatJson } from "../util";

/**
 * Lists a page of functions, page size cannot be greater than 50
 */
export async function lsCommand(take: number, page: number): Promise<void> {
  let marker: string | undefined;
  let currentPage = 0;

  for (;;) {
    const listResult = await lambdaClient
      .listFunctions({
        MaxItems: Math.floor(take),
        Marker: marker,
      })
      .promise();

    if (currentPage === Math.floor(page)) {
      console.log(formatJson(listResult.Functions));
      process.exit(0);
    }
    currentPage++;
    marker = listResult.NextMarker;

    if (!listResult.NextMarker) {
      console.log([]);
      process.exit(0);
    }
  }
}
