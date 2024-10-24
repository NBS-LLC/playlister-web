/**
 * Pauses the execution for a specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified sleep duration.
 */
export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

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
  let result: T | undefined;

  do {
    result = await fn();
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout reached after ${timeout}ms`);
    }
    if (!result) {
      await sleep(100);
    }
  } while (!result);

  return result;
}
