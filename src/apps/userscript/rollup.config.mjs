import alias from "@rollup/plugin-alias";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: "out/apps/userscript/index.js",
  output: {
    banner: readFileSync("banner.js", "utf8"),
    file: "dist/playlister.user.js",
    format: "cjs",
  },
  plugins: [
    alias({
      entries: [
        { find: "#lib", replacement: path.resolve(__dirname, "out/lib") },
      ],
    }),
    nodeResolve(),
  ],
};
