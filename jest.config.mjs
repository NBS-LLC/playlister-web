import { readFile } from "fs/promises";

export default {
  collectCoverageFrom: ["src/**/*.ts"],
  preset: "ts-jest",
  testPathIgnorePatterns: (await readFile(".gitignore", "utf8"))
    .trim()
    .split("\n"),
};
