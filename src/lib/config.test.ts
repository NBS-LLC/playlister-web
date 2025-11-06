import { config } from "./config";

describe("namespace", () => {
  it("returns a formatted namespace string if app id is set", () => {
    const testAppId = "my-test-app";
    config.appId = testAppId;
    expect(config.namespace).toBe(`${testAppId}:`);
  });
});
