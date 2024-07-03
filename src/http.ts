async function fetchNextPage(url: string, requestInit: RequestInit) {
  const response = await fetch(url, requestInit);
  const data = await response.json();
  return { currentPageData: data.items, nextPageUrl: data.next };
}

/**
 * Fetches all data from a paginated API.
 *
 * @param baseUrl - The base URL of the API.
 * @param requestInit - The request initialization options.
 * @return A promise that resolves to an array of all the fetched data.
 */
export async function fetchAllData(baseUrl: string, requestInit: RequestInit) {
  let allData = [];
  let nextPageUrl = baseUrl;
  while (nextPageUrl) {
    const { currentPageData, nextPageUrl: newNextPageUrl } =
      await fetchNextPage(nextPageUrl, requestInit);
    allData = allData.concat(currentPageData);
    nextPageUrl = newNextPageUrl;
  }
  return allData;
}
