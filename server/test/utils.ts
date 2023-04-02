// const chai = require("chai");
import fs from "fs-extra";
import path from "path";
import axios from "axios";
import rimraf from "rimraf";
const words = ["aa", "bb", "cc"];

const grid = {
  id: "b5ee8aa3323f399c48c99e1dfe8d9216",
  rows: 2,
  cols: 2,
  cells: [
    [
      {
        x: 0,
        y: 0,
        definition: true,
        highlighted: false,
        arrows: [],
        suggestion: "",
        text: "",
      },
      {
        x: 1,
        y: 0,
        definition: false,
        highlighted: false,
        arrows: [],
        suggestion: "",
        text: "A",
      },
    ],
    [
      {
        x: 0,
        y: 1,
        definition: false,
        highlighted: false,
        arrows: [],
        suggestion: "",
        text: "B",
      },
      {
        x: 1,
        y: 1,
        definition: false,
        highlighted: false,
        arrows: [],
        suggestion: "",
        text: "C",
      },
    ],
  ],
  comment: "",
  created: 1679337474082,
  title: "grid1",
  optionsId: "default",
};
export { grid as baseGrid, words as baseWords };
type ReqOptions = {
  req: string;
  method?: "get" | "post" | "put" | "delete";
  payload?: any;
};
export function sendRequest({ req, method = "get", payload = {} }: ReqOptions) {
  const url = `http://localhost:${global.APP_CROSSWORDS_PORT}${req}`;
  if (method !== "get") {
    return axios[method](url, payload, {
      headers: {
        authorization: "token",
      },
    })

      .then((res) => {
        return { err: null, res };
      })
      .catch((err) => {
        return { err, res: null };
      });
  }
  return axios[method](url)
    .then((res) => ({ err: null, res }))
    .catch((err) => {
      return { err, res: null };
    });
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms)) as Promise<void>;
}

export function writeDb({ grids = 2 } = {}) {
  const gs = new Array(grids).fill(0).map((_, i) => ({
    ...grid,
    id: `${i}`,
    name: "grid" + i,
  }));
  const paths = [path.parse(global.APP_CROSSWORDS_WORDS_PATH).dir];
  return Promise.all(paths.map((p) => rimraf(p)))
    .then(() => Promise.all(paths.map((p) => fs.mkdir(p))))
    .then(() =>
      Promise.all([
        fs.writeFile(global.APP_CROSSWORDS_WORDS_PATH, words.join(",")),
        fs.writeFile(global.APP_CROSSWORDS_GRIDS_PATH, JSON.stringify(gs)),
      ])
    );
}
