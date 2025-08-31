import { readFileSync } from "fs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "out/apps/userscript/index.js",
  output: {
    banner: readFileSync("banner.js", "utf8"),
    file: "dist/playlister.user.js",
    format: "cjs",
  },
  plugins: [nodeResolve()],
};
