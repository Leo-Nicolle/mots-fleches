const dotenv = require("dotenv");

const { parsed } = dotenv.config({
  path: process.env.MODE === "test" ? "test/.test.env" : ".env",
});
if(process.env.MODE === 'prod'){
  parsed.APP_OPEN_BROWSER = 1;
}

const logPlugin = {
  name: "log",
  setup(build) {
    build.onEnd((result) => {
      console.log(`built with ${result.errors.length} errors`);
    });
  },
};
const watch = process.argv.slice(2).some((a) => a === "--watch");
require("esbuild").build({
  entryPoints: ["lib/index.js"],
  bundle: true,
  format: "cjs",
  outfile: "dist/server.js",
  platform: "node",
  watch,
  define: Object.entries(parsed).reduce((acc, [key, value]) => {
    acc[key] = `"${value}"`;
    return acc;
  }, {}),
  plugins: [logPlugin],
});
