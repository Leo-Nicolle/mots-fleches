import { writeDb, sendRequest, baseGrid, wait } from "./utils";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { createApp } from "../lib/app";
import db from "../lib/database";

describe("Grid controller", () => {
  beforeAll(() =>
    writeDb({ grids: 2 })
      .then(() => db.load())
      .then(() => {
        const { app, server } = createApp();
        global.app = app;
        global.server = server;
        return wait(200);
      })
  );

  afterAll(() => {
    return wait(200).then(() => global.server.close());
  });
  // Test to get all students record
  it("should send all the grids", () => {
    return sendRequest({
      req: "/grid",
    }).then(({ err, res }) => {
      expect(res.status).to.equal(200);
      expect(err).to.be.null;
      expect(res.data).to.have.length(2);
    });
  });
  it("should send a grid by id", () => {
    return sendRequest({
      req: "/grid/1",
    }).then(({ err, res }) => {
      expect(res.status).to.equal(200);
      expect(err).to.be.null;
      expect(+res.data.id).to.be.equal(1);
    });
  });
  it("should add a grid if id is unknown", () => {
    const payload = {
      grid: JSON.stringify({
        ...baseGrid,
        id: "3",
        title: "grid3",
      }),
    };
    return sendRequest({
      req: "/grid",
      method: "post",
      payload,
    })
      .then(({ err, res }) => {
        expect(res.status).to.equal(200);
        expect(err).to.be.null;
        expect(res.data).to.not.equal(null);
        return res.data;
      })
      .then(() => {
        return sendRequest({
          req: `/grid/3`,
        }).then(({ err, res }) => {
          expect(res.status).to.equal(200);
          expect(err).to.be.null;
          expect(res.data).to.deep.equal(JSON.parse(payload.grid));
        });
      });
  });
  it("should update a grid", () => {
    const updatedGrid = {
      ...baseGrid,
      title: "grid-updated",
      id: "0",
      comment: "comment-updated",
    };
    return sendRequest({
      req: "/grid",
      method: "post",
      payload: { grid: JSON.stringify(updatedGrid) },
    })
      .then(({ err, res }) => {
        expect(res.status).to.equal(200);
        expect(err).to.be.null;
        expect(res.text).to.not.equal(null);
        return res.text;
      })
      .then((id) =>
        sendRequest({
          req: `/grid/0`,
        }).then(({ err, res }) => {
          expect(res.status).to.equal(200);
          expect(err).to.be.null;
          expect(res.data).to.deep.equal(updatedGrid);
          return res;
        })
      )
      .then(() =>
        sendRequest({
          req: "/grid",
        }).then(({ err, res }) => {
          expect(res.status).to.equal(200);
          expect(err).to.be.null;
          expect(res.data).to.have.length(3);
          return res;
        })
      );
  });

  it("should delete a grid", () => {
    return sendRequest({
      req: "/grid/1",
      method: "delete",
    })
      .then(({ err, res }) => {
        expect(res.status).to.equal(200);
      })
      .then(() =>
        sendRequest({
          req: "/grid",
        }).then(({ err, res }) => {
          expect(res.status).to.equal(200);
          expect(err).to.be.null;
          expect(res.data).to.have.length(2);
          expect(res.data.map((g) => g.id)).to.not.contain("1");
          return res;
        })
      );
  });
});
