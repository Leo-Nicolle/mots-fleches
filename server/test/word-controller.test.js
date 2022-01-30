const chai = require("chai");
const chaiHttp = require("chai-http");
const regeneratorRuntime = require("regenerator-runtime");
global.regeneratorRuntime = regeneratorRuntime;

import { writeDb, sendRequest, baseWords } from "./utils";
chai.use(chaiHttp);

writeDb().then(() => {
  global.app = require("../dist/test/server");
});
const { expect } = chai;

describe("Word controller", () => {
  before((done) => {
    writeDb().then(() => {
      const { createApp } = require("../dist/test/server.js");
      const { app, server } = createApp();
      global.app = app;
      global.server = server;
      setTimeout(() => {
        done();
      }, 500);
    });
  });

  after((done) => {
    global.server.close();
    setTimeout(() => {
      done();
    }, 1000);
  });
  // Test to get all students record
  it("should send all the words", () => {
    return sendRequest({
      req: "/word",
      callback: (err, res) => {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.body).to.have.length(3);
        expect(res.body).to.deep.equal(baseWords);
      },
    });
  });

  it("should add a word", () => {
    return sendRequest({
      req: "/word",
      method: "post",
      payload: {
        word: "newWord",
      },
      callback: (err, res) => {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        return res.text;
      },
    }).then(() =>
      sendRequest({
        req: "/word",
        callback: (err, res) => {
          expect(res).to.have.status(200);
          expect(err).to.be.null;
          expect(res.body).to.have.length(4);
          expect(res.body).to.deep.equal([...baseWords, "newWord"]);
        },
      })
    );
  });
  it("should not add an already there word", () => {
    return sendRequest({
      req: "/word",
      method: "post",
      payload: {
        word: "newWord",
      },
      callback: (err, res) => {
        expect(res).to.have.status(500);
        expect(err).to.be.null;
        return res.text;
      },
    }).then(() =>
      sendRequest({
        req: "/word",
        callback: (err, res) => {
          expect(res).to.have.status(200);
          expect(err).to.be.null;
          expect(res.body).to.have.length(4);
          expect(res.body).to.deep.equal([...baseWords, "newWord"]);
        },
      })
    );
  });

  it("should delete a word", () => {
    return sendRequest({
      req: "/word/bb",
      method: "delete",
      callback: (err, res) => {
        expect(res).to.have.status(200);
      },
    }).then(() =>
      sendRequest({
        req: "/word",
        callback: (err, res) => {
          expect(res).to.have.status(200);
          expect(err).to.be.null;
          expect(res.body).to.have.length(3);
          expect(res.body).to.deep.equal([
            ...baseWords.filter((w) => w !== "bb"),
            "newWord",
          ]);
        },
      })
    );
  });
});
