import { body, validationResult } from "express-validator";
import crypto from "crypto";

export default function gridController({ app, db }) {
  app.get("/grid", async (req, res) => {
    const grids = await db.getGrids();
    res.send(grids);
  });

  app.get("/grid/:id", async (req, res) => {
    const grid = await db.getGrid(req.params.id);
    if (!grid) return res.send(400);
    res.send(grid);
  });

  app.post(
    "/grid",
    [
      body("rows").isNumeric(),
      body("cols").isNumeric(),
      body("comment").isString(),
      body("cells").isObject(),
      body("name").isString().notEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(500).json({ errors: errors.array() });
      }
      let id;
      try {
        if (req.body.id) {
          id = req.body.id;
          await db.updateGrid({
            ...req.body,
          });
        } else {
          id = crypto.randomBytes(16).toString("hex");

          await db.pushGrid({
            ...req.body,
            id,
          });
        }
      } catch (e) {
        console.log("error", e);
        return res.status(500).send(e.message);
      }
      res.status(200).send(id);
    }
  );
  app.delete("/grid/:grid", async (req, res) => {
    await db.deleteGrid(req.params.grid);
    res.sendStatus(200);
  });
}
