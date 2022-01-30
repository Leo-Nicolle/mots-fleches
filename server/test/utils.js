const chai = require("chai");
import fs from "fs/promises";
const words = ["aa", "bb", "cc"];
const grid = {
  comment: "",
  rows: 2,
  cols: 2,
  cells: {
    "0,0": { isDefinition: true, value: "\n" },
    "0,1": { isDefinition: false, value: "A" },
    "1,0": { isDefinition: false, value: "B" },
    "1,1": { isDefinition: false, value: "C" },
  },
};
export { grid as baseGrid, words as baseWords };

export function sendRequest({ req, callback, method = "get", payload = {} }) {
  if (method !== "get") {
    return new Promise((resolve, reject) => {
      chai
        .request(app)
        [method](req)
        .set("authorization", "token")
        .send(payload)
        .end((err, res) => {
          resolve(callback ? callback(err, res) : () => {});
        });
    });
  }
  return new Promise((resolve, reject) => {
    chai
      .request(app)
      .get(req)
      .set("authorization", "token")
      .end((err, res) => {
        resolve(callback(err, res));
      });
  });
}

export function writeDb({ grids = 2 } = {}) {
  let database;
  const gs = new Array(grids).fill(0).map((_, i) => ({
    ...grid,
    id: `${i}`,
    name: "grid" + i,
  }));
  return Promise.all([
    fs.writeFile(process.env.APP_CROSSWORDS_WORDS_PATH, words.join(",")),
    fs.writeFile(process.env.APP_CROSSWORDS_GRIDS_PATH, JSON.stringify(gs)),
  ])
    .then(() => {
      database = require("../lib/database").default;
      return database.getWords();
    })
    .then(() => {
      return database;
    });
}
