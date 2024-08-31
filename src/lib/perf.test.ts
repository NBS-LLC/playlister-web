import { describe, expect, it } from "@jest/globals";
import { measurePerformance } from "./perf";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe(measurePerformance.name, () => {
  it("should measure the performance of the supplied function", async () => {
    const result = await measurePerformance(async () => {
      await sleep(150);
    });

    expect(result.time).toBeGreaterThan(140);
    expect(result.time).toBeLessThan(200);
  });

  it("should return the result of the supplied function", async () => {
    const result = await measurePerformance(async () => {
      return "hello world";
    });

    expect(result.returnValue).toBe("hello world");
  });
});
