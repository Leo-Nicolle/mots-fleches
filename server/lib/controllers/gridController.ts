import { body, validationResult } from "express-validator";
import { Express } from "express";
import { Database } from "../database";

/**
 * Controller for CRUD operations on grids
 */
export default function gridController({
  app,
  db,
}: {
  app: Express;
  db: Database;
}) {
  /**
   * Get all grids
   */
  app.get("/grid", async (req, res) => {
    const grids = await db.getGrids();
    res.send(grids);
  });
  /**
   * Get a grid by id
   */
  app.get("/grid/:id", async (req, res) => {
    const grid = await db.getGrid(req.params.id);
    if (!grid) return res.send(400);
    res.send(grid);
  });
  /**
   * Create/update a grid
   * If the id is does not exist, it will create a new grid
   * If the id exists, it will update the grid
   */
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
  /**
   * Delete a grid
   */
  app.delete("/grid/:grid", async (req, res) => {
    await db.deleteGrid(req.params.grid);
    res.sendStatus(200);
  });
}
