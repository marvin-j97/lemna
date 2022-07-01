import { FunctionList } from "aws-sdk/clients/lambda";

import { lambdaClient } from "../lambda_client";

/**
 * Lists a page of functions, page size cannot be greater than 50
 */
export async function listCommand(take: number, page: number): Promise<FunctionList> {
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
      return listResult.Functions || [];
    }
    currentPage++;
    marker = listResult.NextMarker;

    if (!listResult.NextMarker) {
      return [];
    }
  }
}
