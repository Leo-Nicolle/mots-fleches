const chai = require("chai");
const chaiHttp = require("chai-http");
const regeneratorRuntime = require("regenerator-runtime");
global.regeneratorRuntime = regeneratorRuntime;

import { writeDb, sendRequest, baseGrid } from "./utils";
chai.use(chaiHttp);

writeDb().then(() => {
  global.app = require("../dist/test/server");
});
const { expect } = chai;

describe("Grid controller", () => {
  before((done) => {
    writeDb({ grids: 2 }).then(() => {
      const { createApp } = require("../dist/test/server.js");
      const { app, server } = createApp();
      global.app = app;
      global.server = server;
      setTimeout(() => {
        done();
      }, 500)
    });
  });

  after((done) => {
    global.server.close();
    setTimeout(() => {
      done();
    }, 1000);
  });
  // Test to get all students record
  it("should send all the grids", () => {
    return sendRequest({
      req: "/grid",
      callback: (err, res) => {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.body).to.have.length(2);
      },
    });
  });
  it("should send a grid by id", () => {
    return sendRequest({
      req: "/grid/1",
      callback: (err, res) => {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(+res.body.id).to.be.equal(1);
      },
    });
  });
  it("should add a grid and add id", () => {
    return sendRequest({
      req: "/grid",
      method: "post",
      payload: {
        ...baseGrid,
        name: "grid3",
      },
      callback: (err, res) => {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.text).to.not.equal(null);
        return res.text;
      },
    }).then((id) =>
      sendRequest({
        req: `/grid/${id}`,
        callback: (err, res) => {
          expect(res).to.have.status(200);
          expect(err).to.be.null;
          expect(res.body).to.have.all.keys(
            "id",
            "name",
            "comment",
            "rows",
            "cols",
            "cells"
          );
          return res;
        },
      })
    );
  });
  it("should update a grid", () => {
    const updatedGrid = {
      name: "grid-updated",
      id: "1",
      comment: "comment-updated",
      rows: 1,
      cols: 1,
      cells: {
        "0,0": { isDefinition: false, value: "U" },
      },
    };
    return sendRequest({
      req: "/grid",
      method: "post",
      payload: updatedGrid,
      callback: (err, res) => {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.text).to.not.equal(null);
        return res.text;
      },
    })
      .then((id) =>
        sendRequest({
          req: `/grid/${id}`,
          callback: (err, res) => {
            expect(res).to.have.status(200);
            expect(err).to.be.null;
            expect(res.body).to.deep.equal(updatedGrid);
            return res;
          },
        })
      )
      .then(() =>
        sendRequest({
          req: "/grid",
          callback: (err, res) => {
            expect(res).to.have.status(200);
            expect(err).to.be.null;
            expect(res.body).to.have.length(3);
            return res;
          },
        })
      );
  });

  it("should delete a grid", () => {
    return sendRequest({
      req: "/grid/1",
      method: "delete",
      callback: (err, res) => {
        expect(res).to.have.status(200);
      },
    }).then(() =>
      sendRequest({
        req: "/grid",
        callback: (err, res) => {
          expect(res).to.have.status(200);
          expect(err).to.be.null;
          expect(res.body).to.have.length(2);
          expect(res.body.map((g) => g.id)).to.not.contain("1");
          return res;
        },
      })
    );
  });
});
