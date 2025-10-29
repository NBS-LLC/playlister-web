export default {
  collectCoverage: true,
  collectCoverageFrom: ["**/*.ts"],
  preset: "ts-jest",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  verbose: true,
};
