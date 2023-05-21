import { Express } from "express";
import { FSDatabase } from "database";

/**
 * Controler for database operations
 */
export default function dbController({
  app,
  db,
}: {
  app: Express;
  db: FSDatabase;
}) {
  /**
   * Reload the database
   */
  app.get("/reload", async (req, res) => {
    try {
      await db.load();
    } catch (e) {
      console.log("ERROR", e);
    }
    res.send(200);
  });
}
