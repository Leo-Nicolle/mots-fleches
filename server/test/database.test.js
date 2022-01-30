const chai = require("chai");
import fs from "fs/promises";

const { expect } = chai;

let database;
describe("Doors", () => {
  before(() => {
    const words = ["aa", "bb", "cc"].join(",");
    const grids = [
      {
        comment: "",
        name: "grid1",
        id: "b5ee8aa3323f399c48c99e1dfe8d9216",
        rows: 2,
        cols: 2,
        cells: {
          "0,0": { isDefinition: true, value: "\n" },
          "0,1": { isDefinition: false, value: "A" },
          "1,0": { isDefinition: false, value: "B" },
          "1,1": { isDefinition: false, value: "C" },
        },
      },
    ];
    return Promise.all([
      fs.writeFile(process.env.APP_CROSSWORDS_WORDS_PATH, words),
      fs.writeFile(
        process.env.APP_CROSSWORDS_GRIDS_PATH,
        JSON.stringify(grids)
      ),
    ])
      .then(() => {
        database = require("../lib/database").default;
        return database.getWords();
      })
  });

  it("should read the saved database", () => {
    expect(database.words.length).equal(3);
    expect(database.grids.length).equal(1);
  });

  it("should be able to push a word", () =>
    database.pushWord("dd").then(() => {
      expect(database.words).to.have.same.members(['aa', 'bb', 'cc', 'dd'])
      return fs.readFile(process.env.APP_CROSSWORDS_WORDS_PATH, "utf-8")
      .then((data) => {
        expect(data).to.equal('aa,bb,cc,dd')
      });
  }))

  it("should be able to delete a word", () =>
  database.deleteWord("dd").then(() => {
    expect(database.words).to.have.same.members(['aa', 'bb', 'cc'])
    return fs.readFile(process.env.APP_CROSSWORDS_WORDS_PATH, "utf-8")
    .then((data) => {
      expect(data).to.equal('aa,bb,cc')
    });
  }))

});
