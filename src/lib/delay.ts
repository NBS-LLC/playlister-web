/**
 * Pauses execution for a specified amount of time.
 *
 * @param ms - The number of milliseconds to wait.
 * @returns A promise that resolves after the specified delay.
 * @example
 * ```typescript
 * console.log("Start");
 * await delay(1000);
 * console.log("End");
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
