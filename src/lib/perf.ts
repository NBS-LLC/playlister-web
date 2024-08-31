/**
 * Measures the performance of a given asynchronous function.
 *
 * @param func - The function to measure the performance of.
 * @return A promise that resolves to an object containing the return value of the function and the execution time in milliseconds.
 */
export async function measurePerformance<T>(
  func: () => Promise<T>,
): Promise<{ returnValue: T; time: number }> {
  const startTime = performance.now();
  const returnValue = await func();
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  return { returnValue, time: executionTime };
}
