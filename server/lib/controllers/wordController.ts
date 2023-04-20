import { body, validationResult } from "express-validator";
import dico from "../search/dico";
import { Express } from "express";
import { Database } from "../database";

/**
 * Controller for CRUD operations on words
 */
export default function wordController({
  app,
  db,
}: {
  app: Express;
  db: Database;
}) {
  /**
   * Get all words
   */
  app.get("/word", async (req, res) => {
    const words = await db.getWords();
    res.send(words);
  });
  // app.get("/dico-length", async (req, res) => {
  //   res.send(
  //     dico.words
  //       .reduce((acc, w) => {
  //         acc[w.length] += 1;
  //         return acc;
  //       }, new Array(32).fill(0))
  //       .map((e) => (e / dico.words.length) * 100)
  //   );
  // });
  /**
   * Get all words
   */
  app.get("/dico", async (req, res) => {
    const words = await dico.getWords();
    res.send(words);
  });
  /**
   * Add a word
   */
  app.post("/word", [body("word").isString().notEmpty()], async (req, res) => {
    const word = req.body.word.trim().toUpperCase() as string;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }
    const exists = (await db.getWords()).find((w) => !w.localeCompare(word));
    if (exists) {
      return res.status(500).json({ errors: [{ msg: "exists already" }] });
    }
    try {
      await db.pushWord(word);
    } catch (e) {
      return res.status(500).send(e.message);
    }
    dico.addWordsToDictionnary([word] as string[]);
    res.sendStatus(200);
    res.send();
  });
  /**
   * Delete a word
   */
  app.delete("/word/:word", async (req, res) => {
    const word = req.params.word.trim().toUpperCase();
    await db.deleteWord(word);
    dico.removeWordsFromDictionary([word]);
    res.sendStatus(200);
  });

  /**
   * Get length distribution within dico
   */
  app.get("/word/distribution", async (req, res) => {
    const words = await dico.getWords();
    const distribution = words.reduce((acc, w) => {
      if (!acc[w.length]) acc[w.length] = 0;
      acc[w.length] += 1;
      return acc;
    }, {} as { [key: number]: number });
    Object.entries(distribution).forEach(([key, value]) => {
      distribution[key] = value / words.length;
    });
    res.send(distribution);
  });
}
