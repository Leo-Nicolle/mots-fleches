import dico from "../lib/search/dico";
import search, { Search } from "../lib/search/index";
import { findBoundaries } from "../lib/search/utils";

const fs = require("fs").promises;
const chai = require("chai");
const { expect } = chai;

const grid = [
  ["\n", "A", "B", "C", ""],
  ["", "B", "", "", ""],
  ["", "C", "\n", "", ""],
];
const isDefinition = [
  [true, false, false, false, false],
  [false, false, false, false, false],
  [false, false, true, false, false],
];

let baseWords;
describe("Search", () => {
  before(() => {
    return dico
      .loadDictionary()
      .then(() => fs.readFile("./test/words-search-test.txt", "utf8"))
      .then((data) => {
        dico.addWordsToDictionnary(data);
      });
  });

  it("should get the lemme list correctly", () => {
    const coord = { x: 1, y: 1 };
    const vec = { x: 1, y: 0 };
    const { start, length } = findBoundaries({
      grid,
      coord,
      vec,
      isDefinition,
    });
    const lemmes = Search.getLemmes({
      grid,
      isDefinition,
      coord: start,
      wordLength: length,
      vec,
    });
    expect(lemmes).to.be.deep.equal([
      {
        indexLemme: 0,
        indexWord: 1,
        length: 3,
        totalLength: 3,
        lemme: "ABC",
      },
      {
        indexLemme: 1,
        indexWord: 1,
        length: 2,
        totalLength: 3,
        lemme: "BC",
      },
      {
        indexLemme: 0,
        indexWord: 2,
        length: 2,
        totalLength: 2,
        lemme: "B.",
      },
      {
        indexLemme: 0,
        indexWord: 3,
        length: 3,
        totalLength: 3,
        lemme: "C.*",
      },
    ]);
    console.log({ lemmes });
  });
  // it("should find lemmes 2", () => {
  //   const coord = { x: 1, y: 1 };
  //   const vec = { x: 0, y: 1 };
  //   const { start, length } = findBoundaries({
  //     grid,
  //     coord,
  //     vec,
  //     isDefinition,
  //   });
  //   const lemmes = Search.getLemmes({
  //     grid,
  //     isDefinition,
  //     coord: start,
  //     wordLength: length,
  //     vec,
  //   });
  //   // here we see problems: there should not be overlapping lemmes
  //   // console.log({ lemmes });
  // });

  it("should retrieve best words", () => {
    const coord = { x: 1, y: 1 };
    const vec = { x: 1, y: 0 };
    const { start, length } = findBoundaries({
      grid,
      coord,
      vec,
      isDefinition,
    });
    const lemmes = Search.getLemmes({
      grid,
      isDefinition,
      coord: start,
      wordLength: length,
      vec,
    });
    const words = dico.words.filter((w) => w.length === length);
    const results = search.getBestWords({
      words,
      lemmes,
      grid,
      start,
      length,
      vec,
    });
    expect(results.words).to.have.members(["ABAAT", "ABAOT"]);
  });
});
