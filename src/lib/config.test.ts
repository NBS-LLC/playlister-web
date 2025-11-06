import { config } from "./config";

describe("Config", () => {
  beforeEach(() => {
    config.appName = "";
    config.appId = "";
  });

  describe("appName", () => {
    it("should set and get the app name", () => {
      const testAppName = "TestAppName";
      config.appName = testAppName;
      expect(config.appName).toBe(testAppName);
    });

    it("should throw an error if appName is accessed before being set", () => {
      expect(() => config.appName).toThrow("appName not set");
    });
  });

  describe("appId", () => {
    it("should set and get the app id", () => {
      const testAppId = "test-app-id";
      config.appId = testAppId;
      expect(config.appId).toBe(testAppId);
    });

    it("should throw an error if appId is accessed before being set", () => {
      expect(() => config.appId).toThrow("appId not set");
    });
  });

  describe("namespace", () => {
    it("returns a formatted namespace string if app id is set", () => {
      const testAppId = "my-test-app";
      config.appId = testAppId;
      expect(config.namespace).toBe(`${testAppId}:`);
    });

    it("should throw an error if namespace is accessed before appId is set", () => {
      expect(() => config.namespace).toThrow("appId not set");
    });
  });

  describe("cache quotas", () => {
    it("should have default cacheQuotaMaxBytes", () => {
      expect(config.cacheQuotaMaxBytes).toBe(5 * 1024 * 1024);
    });

    it("should have default cacheQuotaTargetBytes", () => {
      expect(config.cacheQuotaTargetBytes).toBe(2.5 * 1024 * 1024);
    });
  });
});
