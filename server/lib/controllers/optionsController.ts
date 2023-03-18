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
  app.get("/options", async (req, res) => {
    const options = await db.getOptions();
    res.send(options);
  });

  app.get("/options/:id", async (req, res) => {
    const options = await db.getOption(req.params.id);
    if (!options) return res.send(400);
    res.send(options);
  });

  app.post("/options", [body("options").isObject()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }
    let id;
    try {
      id = await db.updateOption(req.body.options);
    } catch (e) {
      console.log("error", e);
      return res.status(500).send(e.message);
    }
    res.status(200).send(id);
  });

  app.delete("/options/:option", async (req, res) => {
    try {
      await db.deleteOption(req.params.option);
      res.sendStatus(200);
    } catch (e) {
      res.sendStatus(504);
    }
  });
}
