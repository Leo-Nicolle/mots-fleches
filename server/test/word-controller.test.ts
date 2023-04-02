import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { writeDb, sendRequest, baseWords, wait } from "./utils";
import { createApp } from "../lib/app";
import db from "../lib/database";
describe("Word controller", () => {
  beforeAll(() => {
    return writeDb()
      .then(() => db.load())
      .then(() => {
        const { app, server } = createApp();
        global.app = app;
        global.server = server;
      })
      .then(() => wait(500));
  });

  afterAll(() => {
    return global.server.close();
  });
  // Test to get all students record
  it("should send all the words", () => {
    return sendRequest({
      req: "/word",
    }).then(({ err, res }) => {
      expect(res.status).to.equal(200);
      expect(err).to.be.null;
      expect(res.data).to.have.length(3);
      expect(res.data).to.deep.equal(baseWords);
    });
  });

  it("should add a word", () => {
    return sendRequest({
      req: "/word",
      method: "post",
      payload: {
        word: "newWord",
      },
    })
      .then(({ err, res }) => {
        expect(res.status).to.equal(200);
        expect(err).to.be.null;
      })
      .then(() =>
        sendRequest({
          req: "/word",
        })
      )
      .then(({ err, res }) => {
        expect(res.status).to.equal(200);
        expect(err).to.be.null;
        expect(res.data).to.have.length(4);
        expect(res.data).to.deep.equal([...baseWords, "newWord"]);
      });
  });
  it("should not add an already there word", () => {
    return sendRequest({
      req: "/word",
      method: "post",
      payload: {
        word: "newWord",
      },
    })
      .then(({ err, res }) => {
        expect(err.response.status).to.equal(500);
        expect(res).to.be.null;
      })
      .then(() =>
        sendRequest({
          req: "/word",
        })
      )
      .then(({ err, res }) => {
        expect(res.status).to.equal(200);
        expect(err).to.be.null;
        expect(res.data).to.have.length(4);
        expect(res.data).to.deep.equal([...baseWords, "newWord"]);
      });
  });

  it("should delete a word", () => {
    return sendRequest({
      req: "/word/bb",
      method: "delete",
    })
      .then(({ err, res }) => expect(res.status).to.equal(200))
      .then(() =>
        sendRequest({
          req: "/word",
        })
      )
      .then(({ err, res }) => {
        expect(res.status).to.equal(200);
        expect(err).to.be.null;
        expect(res.data).to.have.length(3);
        expect(res.data).to.deep.equal([
          ...baseWords.filter((w) => w !== "bb"),
          "newWord",
        ]);
      });
  });
});
