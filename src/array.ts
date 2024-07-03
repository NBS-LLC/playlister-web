/**
 * Divides an array into smaller arrays of a specified size.
 *
 * @param array - The array to be chunked.
 * @param chunkSize - The size of each chunk.
 * @return An array of arrays, where each inner array contains `chunkSize` elements.
 */
export function chunk<T>(array: T[], chunkSize: number): T[][] {
  const chunkedArray: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    chunkedArray.push(chunk);
  }
  return chunkedArray;
}
