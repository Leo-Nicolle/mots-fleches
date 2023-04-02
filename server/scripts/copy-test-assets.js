const { copy } = require("fs-extra");
const rimraf = require("rimraf");

rimraf("dist/e2e-test/db")
  .then(() => copy("test/e2e/db", "dist/e2e-test/db"))
  .then(() => copy("test/e2e/dico", "dist/e2e-test/dico"));
