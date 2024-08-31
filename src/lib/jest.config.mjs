import { readFile } from "fs/promises";

export default {
  collectCoverage: true,
  collectCoverageFrom: ["**/*.ts"],
  preset: "ts-jest",
  testPathIgnorePatterns: (await readFile("../../.gitignore", "utf8"))
    .trim()
    .split("\n"),
  verbose: true,
};
