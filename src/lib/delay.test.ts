import { delay } from "./delay";

describe(delay.name, () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it("resolves after the specified time", async () => {
    const onResolve = jest.fn();
    const promise = delay(1000).then(onResolve);

    jest.advanceTimersByTime(999);
    await Promise.resolve();
    expect(onResolve).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await promise;
    expect(onResolve).toHaveBeenCalled();
  });
});
