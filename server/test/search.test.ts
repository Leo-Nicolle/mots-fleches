import fs from "fs-extra";
import { beforeAll, describe, it, expect } from "vitest";
import { Grid } from "grid";
import dico from "../lib/search/dico";
import search, { Search } from "../lib/search/index";
import { resolve } from "path";
const grid = new Grid(3, 5, "grid1");
grid.setDefinition({ x: 0, y: 0 }, true);
grid.setDefinition({ x: 2, y: 2 }, true);

grid.setText({ x: 1, y: 0 }, "A");
grid.setText({ x: 1, y: 1 }, "B");
grid.setText({ x: 1, y: 2 }, "C");

grid.setText({ x: 2, y: 0 }, "B");
grid.setText({ x: 3, y: 0 }, "C");

describe("Search", () => {
  beforeAll(() => {
    // return dico
    // .loadDictionary()
    // .then(() =>
    return fs
      .readFile(resolve("./test/dico/fr-fr/words-search-test.txt"), "utf8")
      .then((data) => {
        dico.addWordsToDictionnary(data);
      });
  });

  it("should get the lemme list correctly", () => {
    const coord = { x: 1, y: 1 };
    const { start, length } = grid.getBounds(coord, "horizontal");
    const lemmes = Search.getLemmes({
      grid,
      coord: start,
      wordLength: length,
      dir: "horizontal",
    });
    expect(lemmes).to.be.deep.equal([
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
    const lemmes2 = Search.getLemmes({
      grid,
      coord: { x: 1, y: 0 },
      wordLength: length,
      dir: "vertical",
    });
    expect(lemmes2).to.be.deep.equal([
      {
        indexLemme: 0,
        indexWord: 0,
        length: 3,
        totalLength: 4,
        lemme: "ABC",
      },
      {
        indexLemme: 1,
        indexWord: 0,
        length: 3,
        totalLength: 4,
        lemme: "BC*",
      },
      {
        indexLemme: 2,
        indexWord: 0,
        length: 2,
        totalLength: 4,
        lemme: "C*",
      },
      {
        indexLemme: 0,
        indexWord: 1,
        length: 3,
        totalLength: 5,
        lemme: "*B*",
      },
      {
        indexLemme: 1,
        indexWord: 1,
        length: 3,
        totalLength: 5,
        lemme: "B**",
      },
      {
        indexLemme: 0,
        indexWord: 2,
        length: 2,
        totalLength: 2,
        lemme: "*C",
      },
    ]);
  });

  it("should retrieve best words", () => {
    const coord = { x: 1, y: 1 };
    const dir = "horizontal";
    const { start, length } = grid.getBounds(coord, dir);
    const lemmes = Search.getLemmes({
      grid,
      coord: start,
      wordLength: length,
      dir,
    });
    const words = dico.words.filter((w) => w.length === length);
    const results = search.getBestWords({
      words,
      lemmes,
      grid,
      start,
      length,
      dir,
    });
    expect(results.words).to.have.members(["ABAAT", "ABAOT"]);
  });

  it("getLemme should ignore filled words", () => {
    const coord = { x: 1, y: 1 };
    const dir = "horizontal";
    const { start, length } = grid.getBounds(coord, dir);
    const lemmes = Search.getLemmes({
      grid,
      coord: start,
      wordLength: length,
      dir,
    });
    expect(lemmes.filter(({ indexWord }) => indexWord === 1)).to.have.length(0);
  });
});
