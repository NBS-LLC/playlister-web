import { enableFetchMocks } from "jest-fetch-mock";
enableFetchMocks();

import { describe, expect, it } from "@jest/globals";
import { fetchAllData } from "./http";

describe(fetchAllData.name, () => {
  it("fetches all data correctly with multiple pages", async () => {
    const mockData1 = {
      items: [1, 2, 3],
      next: "nextPageUrl1",
    };
    const mockData2 = {
      items: [4, 5, 6],
      next: "nextPageUrl2",
    };
    const mockData3 = {
      items: [7, 8],
      next: null,
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockData1));
    fetchMock.mockResponseOnce(JSON.stringify(mockData2));
    fetchMock.mockResponseOnce(JSON.stringify(mockData3));

    const result = await fetchAllData("baseUrl", {});
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
