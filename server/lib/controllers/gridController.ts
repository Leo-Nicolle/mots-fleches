import { body, validationResult } from "express-validator";
import { Express } from "express";
import { Database } from "../database";

export default function gridController({
  app,
  db,
}: {
  app: Express;
  db: Database;
}) {
  app.get("/grid", async (req, res) => {
    const grids = await db.getGrids();
    res.send(grids);
  });

  app.get("/grid/:id", async (req, res) => {
    const grid = await db.getGrid(req.params.id);
    if (!grid) return res.send(400);
    res.send(grid);
  });

  app.post("/grid", [body("grid").isString()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }
    let id;
    try {
      id = await db.updateGrid(req.body.grid);
    } catch (e) {
      console.log("error", e);
      return res.status(500).send(e.message);
    }
    res.status(200).send(id);
  });

  app.delete("/grid/:grid", async (req, res) => {
    await db.deleteGrid(req.params.grid);
    res.sendStatus(200);
  });
}
