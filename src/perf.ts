export async function measurePerformance<T>(
  func: () => Promise<T>,
): Promise<{ returnValue: T; time: number }> {
  const startTime = performance.now();
  const returnValue = await func();
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  return { returnValue, time: executionTime };
}
