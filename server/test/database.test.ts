import { beforeAll, afterAll, describe, it, expect } from "vitest";
import fs from "fs-extra";
import { Grid } from "grid";
import database from "../lib/database";
describe("Database", () => {
  beforeAll(() => {
    const words = ["aa", "bb", "cc"].join(",");
    const grids = [JSON.parse(new Grid(2, 2, "grid1").serialize())];
    return Promise.all([
      fs.writeFile(process.env.APP_CROSSWORDS_WORDS_PATH, words),
      fs.writeFile(
        process.env.APP_CROSSWORDS_GRIDS_PATH,
        JSON.stringify(grids)
      ),
    ]).then(() => database.load());
  });

  it("should read the saved database", () => {
    expect(database.words.length).equal(3);
    expect(database.grids.length).equal(1);
  });

  it("should be able to push a word", () =>
    database.pushWord("dd").then(() => {
      expect(database.words).to.have.same.members(["aa", "bb", "cc", "dd"]);
      return fs
        .readFile(process.env.APP_CROSSWORDS_WORDS_PATH, "utf-8")
        .then((data) => {
          expect(data).to.equal("aa,bb,cc,dd");
        });
    }));

  it("should be able to delete a word", () =>
    database.deleteWord("dd").then(() => {
      expect(database.words).to.have.same.members(["aa", "bb", "cc"]);
      return fs
        .readFile(process.env.APP_CROSSWORDS_WORDS_PATH, "utf-8")
        .then((data) => {
          expect(data).to.equal("aa,bb,cc");
        });
    }));

  it("should be able to push a grid", () =>
    database
      .pushGrid(new Grid(2, 2, "grid2"))
      .then(() => database.getGrids())
      .then((grids) => {
        expect(grids.map((g) => g.id)).to.have.same.members(["grid1", "grid2"]);
      })
      .then(() => fs.readFile(process.env.APP_CROSSWORDS_GRIDS_PATH, "utf-8"))
      .then((data) => {
        expect(JSON.parse(data).map((g) => g.id)).to.have.same.members([
          "grid1",
          "grid2",
        ]);
      }));

  it("should be able to update a grid", () => {
    console.log(new Grid(5, 5, "grid-1").serialize());
    const oldGrid = database.grids[1];
    const newGrid = {
      ...oldGrid,
      comment: "Comment to grid2",
    };
    return database
      .updateGrid(JSON.stringify(newGrid))
      .then(() => database.getGrids())
      .then((grids) => {
        expect(JSON.parse(grids[1].serialize())).to.deep.equal(newGrid);
        return fs
          .readFile(process.env.APP_CROSSWORDS_GRIDS_PATH, "utf-8")
          .then((data) => {
            expect(JSON.parse(data)[1]).to.deep.equal(newGrid);
          });
      });
  });

  it("should be able to delete a grid", () =>
    database.deleteGrid("grid2").then(() => {
      expect(database.grids.map((g) => g.id)).to.have.same.members(["grid1"]);
      return fs
        .readFile(process.env.APP_CROSSWORDS_GRIDS_PATH, "utf-8")
        .then((data) => {
          expect(JSON.parse(data).map((g) => g.id)).to.have.same.members([
            "grid1",
          ]);
        });
    }));
});
