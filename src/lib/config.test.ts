import { config } from "./config";

describe("namespace", () => {
  beforeEach(() => {
    config.appId = "";
  });

  it("returns an empty string if app id is not set", () => {
    expect(config.namespace).toBe("");
  });

  it("returns a formatted namespace string if app id is set", () => {
    const testAppId = "my-test-app";
    config.appId = testAppId;
    expect(config.namespace).toBe(`${testAppId}:`);
  });
});
