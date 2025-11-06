export default {
  collectCoverage: true,
  collectCoverageFrom: ["**/*.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", ".test-data.ts"],
  preset: "ts-jest",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  verbose: true,
};
