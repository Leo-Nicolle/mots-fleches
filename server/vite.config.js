import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import dotenv from "dotenv";
import typescript from "@rollup/plugin-typescript";

dotenv.config({
  path: process.env.MODE === "test" ? "test/.test.env" : ".env",
});
const output = "./dist/server.js";
console.log(process.env.MODE, output);
// process.env.MODE === "test" ? "./dist/test/server.js" : "pkg.main";
// const input = process.env.MODE === "test" ? "lib/app.js" : "lib/index.js";

const variablesToReplace = Object.entries(process.env)
  .filter(([key]) => key.match(/APP_CROSSWORDS_.+/))
  .reduce((variablesToReplace, [key, value]) => {
    variablesToReplace[`process.env.${key}`] = JSON.stringify(value);
    return variablesToReplace;
  }, {});

export default {
  build: {
    lib: {
      entry: "lib/app.js",
      name: "server",
    },
    rollupOptions: {
      output,
      plugins: [
        replace(variablesToReplace),
        resolve(),
        json(),
        typescript(),
        commonjs(),
      ],
      // https://rollupjs.org/guide/en/#big-list-of-options
    },
  },
  // resolve: {
  //   alias: {
  //     'fs': 'rollup-plugin-node-polyfills'
  //   }
  // }
};
