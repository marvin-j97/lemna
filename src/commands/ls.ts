import { FunctionConfiguration, ListFunctionsCommand } from "@aws-sdk/client-lambda";

import { Lemna } from "../lemna";

/**
 * Lists a page of functions, page size cannot be greater than 50
 */
export async function listCommand(
  client: Lemna,
  take: number,
  page: number,
): Promise<FunctionConfiguration[]> {
  let marker: string | undefined;
  let currentPage = 0;

  for (;;) {
    const listResult = await client.lambdaClient.send(
      new ListFunctionsCommand({
        MaxItems: Math.floor(take),
        Marker: marker,
      }),
    );

    if (currentPage === Math.floor(page)) {
      return listResult.Functions ?? [];
    }
    currentPage++;
    marker = listResult.NextMarker;

    if (!listResult.NextMarker) {
      return [];
    }
  }
}
