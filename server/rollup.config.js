import pkg from "./package.json";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import dotenv from "dotenv";
import typescript from "@rollup/plugin-typescript";

dotenv.config({
  path: process.env.MODE === "test" ? "test/.test.env" : ".env",
});
console.log(process.env.MODE);
const output =
  process.env.MODE === "test" ? "./dist/test/server.js" : "pkg.main";
const input = process.env.MODE === "test" ? "lib/app.js" : "lib/index.js";

console.log("building in mode:", process.env.MODE);
const variablesToReplace = Object.entries(process.env)
  .filter(([key]) => key.match(/APP_CROSSWORDS_.+/))
  .reduce((variablesToReplace, [key, value]) => {
    variablesToReplace[`process.env.${key}`] = JSON.stringify(value);
    return variablesToReplace;
  }, {});
console.log("variables to replace:", variablesToReplace);

const plugins = [
  replace(variablesToReplace),
  resolve(),
  json(),
  typescript(),
  commonjs(),
];

export default {
  input,
  output: [{ file: output, format: "cjs" }],
  plugins,
};
