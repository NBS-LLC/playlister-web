export default {
  collectCoverageFrom: ["src/**/*.ts"],
  preset: "ts-jest",
  testPathIgnorePatterns: ["coverage/", "dist/", "node_modules/", "out/"],
};
