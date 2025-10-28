import { config } from "./config";
import { log } from "./log";

describe("log", () => {
  describe("namespace", () => {
    const originalAppId = config.appId;

    afterEach(() => {
      config.appId = originalAppId;
    });

    it("returns an empty string when appId is not configured", () => {
      config.appId = "";
      expect(log.namespace).toBe("");
    });

    it("returns a formatted namespace string when appId is configured", () => {
      const testAppId = "my-test-app";
      config.appId = testAppId;
      expect(log.namespace).toBe(`[${testAppId}]`);
    });
  });
});
