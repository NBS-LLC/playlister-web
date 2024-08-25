import { readFile } from "fs/promises";

export default {
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  projects: [
    {
      preset: "ts-jest",
      displayName: "shared-lib",
      testMatch: ["<rootDir>/src/lib/**/*.test.ts"],
    },
  ],
  testPathIgnorePatterns: (await readFile(".gitignore", "utf8"))
    .trim()
    .split("\n"),
  verbose: true,
};
