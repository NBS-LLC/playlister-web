import { config } from "./config";
import { log } from "./log";

describe("log", () => {
  describe("namespace", () => {
    it("returns a formatted namespace string when appId is configured", () => {
      const testAppId = "my-test-app";
      config.appId = testAppId;
      expect(log.namespace).toBe(`[${testAppId}]`);
    });
  });
});
