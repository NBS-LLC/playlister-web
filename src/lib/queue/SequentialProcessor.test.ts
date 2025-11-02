import { delay } from "../delay";
import { SequentialProcessor } from "./SequentialProcessor";

jest.mock("../delay");
jest.useFakeTimers();

describe(SequentialProcessor.name, () => {
  let processor: SequentialProcessor<string>;
  let processFn: jest.Mock<Promise<void>, [string]>;
  const MIN_DELAY_MS = 100;

  beforeEach(() => {
    processFn = jest.fn().mockResolvedValue(undefined);
    processor = new SequentialProcessor(processFn, MIN_DELAY_MS);
    (delay as jest.Mock).mockClear();
  });

  it("should process a single item", async () => {
    processor.enqueue("item1");
    await jest.runAllTimersAsync();
    expect(processFn).toHaveBeenCalledWith("item1");
    expect(processFn).toHaveBeenCalledTimes(1);
  });

  it("should process multiple items sequentially", async () => {
    processor.enqueue("item1");
    processor.enqueue("item2");
    processor.enqueue("item3");

    await jest.runAllTimersAsync();

    expect(processFn).toHaveBeenCalledTimes(3);
    expect(processFn).toHaveBeenNthCalledWith(1, "item1");
    expect(processFn).toHaveBeenNthCalledWith(2, "item2");
    expect(processFn).toHaveBeenNthCalledWith(3, "item3");
  });

  it("should wait for the minimum delay between processing items", async () => {
    processor.enqueue("item1");
    processor.enqueue("item2");

    await jest.runAllTimersAsync();

    expect(delay).toHaveBeenCalledWith(MIN_DELAY_MS);
    expect(delay).toHaveBeenCalledTimes(2);
  });

  it("should continue processing if an item fails", async () => {
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    const error = new Error("Processing failed");
    processFn.mockImplementation(async (item) => {
      if (item === "item2") {
        throw error;
      }
    });

    processor.enqueue("item1");
    processor.enqueue("item2");
    processor.enqueue("item3");

    await jest.runAllTimersAsync();

    expect(processFn).toHaveBeenCalledTimes(3);
    expect(consoleWarnSpy).toHaveBeenCalledWith(error);
    expect(processFn).toHaveBeenCalledWith("item1");
    expect(processFn).toHaveBeenCalledWith("item2");
    expect(processFn).toHaveBeenCalledWith("item3");

    consoleWarnSpy.mockRestore();
  });
});
