import { readFile } from "fs/promises";

export default {
  collectCoverage: true,
  projects: [
    {
      collectCoverageFrom: ["<rootDir>/src/lib/**/*.ts"],
      displayName: "shared-lib",
      testMatch: ["<rootDir>/src/lib/**/*.test.ts"],
      preset: "ts-jest",
    },
  ],
  testPathIgnorePatterns: (await readFile(".gitignore", "utf8"))
    .trim()
    .split("\n"),
  verbose: true,
};
