import { config } from "./config";
import { LibError } from "./error";

describe(LibError.name, () => {
  beforeEach(() => {
    config.appName = "";
    config.appId = "";
  });

  it("prefixes message with a namespace", () => {
    config.appId = "test-app";
    const error = new LibError("unit test message");
    expect(error.message).toBe("[test-app] unit test message");
  });

  it("allows cause to be specified", () => {
    config.appId = "test-app";
    const error = new LibError("unit test message", {
      cause: "something else",
    });
    expect(error.cause).toBe("something else");
  });
});
