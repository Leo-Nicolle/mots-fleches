const dotenv = require("dotenv");
const { copy } = require("fs-extra");

const { parsed } = dotenv.config({
  path:
    process.env.MODE === "test"
      ? "test/.test.env"
      : process.env.MODE === "e2e-test"
      ? "test/e2e/.env"
      : ".env",
});
if (process.env.MODE === "prod") {
  parsed.APP_OPEN_BROWSER = 1;
  parsed.APP_CROSSWORDS_MODE = "prod";
}
if (process.env.MODE !== "test" && process.env.MODE !== "e2e-test") {
  copy("../client/dist", "dist/public");
}
let outfile = "dist/server.js";
if (process.env.MODE === "e2e-test") {
  outfile = "dist/e2e-test/server.js";
}

const logPlugin = {
  name: "log",
  setup(build) {
    build.onEnd((result) => {
      console.log(`built with ${result.errors.length} errors`);
    });
  },
};
// TODO restore watch with new esbild version
// const watch = process.argv.slice(2).some((a) => a === "--watch");
require("esbuild").build({
  entryPoints: ["lib/index.js"],
  bundle: true,
  format: "cjs",
  target: "es6",
  outfile,
  platform: "node",
  define: Object.entries(parsed).reduce((acc, [key, value]) => {
    acc[key] = `"${value}"`;
    return acc;
  }, {}),
  plugins: [logPlugin],
});
