async function fetchNextPage(url: string, requestInit: RequestInit) {
  const response = await fetch(url, requestInit);
  const data = await response.json();
  return { currentPageData: data.items, nextPageUrl: data.next };
}

export async function fetchAllData(
  baseUrl: string,
  requestInit: RequestInit,
  allData = [],
) {
  let nextPageUrl = baseUrl;
  while (nextPageUrl) {
    const { currentPageData, nextPageUrl: newNextPageUrl } =
      await fetchNextPage(nextPageUrl, requestInit);
    allData = allData.concat(currentPageData);
    nextPageUrl = newNextPageUrl;
  }
  return allData;
}
