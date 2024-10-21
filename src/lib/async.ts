/**
 * Waits for the given function to return a truthy value.
 *
 * @param fn - The function to wait for. This function should return a truthy value when the condition is met.
 * @param timeout - The maximum amount of time to wait in milliseconds. Defaults to 10000ms.
 * @returns A promise that resolves to the truthy value of the function or rejects with an error if the timeout is reached.
 */
export async function until<T>(
  fn: () => Promise<T> | T,
  timeout: number = 10000,
): Promise<T> {
  const startTime = Date.now();

  while (true) {
    const result = await fn();

    if (result) {
      return result;
    }

    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout reached after ${timeout}ms`);
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 100));
  }
}
