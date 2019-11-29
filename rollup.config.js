import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";
import { terser } from "rollup-plugin-terser";

// Delete old typings to avoid issues
require("fs").unlink("dist/index.d.ts", err => {});

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs"
    },
    {
      file: pkg.module,
      format: "es"
    },
    {
      file: pkg.browser,
      format: "umd",
      name: "Defo"
    }
  ],
  external: [...Object.keys(pkg.dependencies || {})],
  plugins: [
    typescript({
      typescript: require("typescript")
    }),
    terser()
  ]
};
