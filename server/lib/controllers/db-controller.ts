import { Express } from "express";
import { Database } from "../database";
export default function dbController({
  app,
  db,
}: {
  app: Express;
  db: Database;
}) {
  app.get("/reload", async (req, res) => {
    console.log("RELOAD");
    try {
      await db.load();
    } catch (e) {
      console.log("ERROR", e);
    }
    res.send(200);
  });
}
