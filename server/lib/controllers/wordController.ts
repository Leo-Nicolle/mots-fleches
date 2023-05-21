import { body, validationResult } from "express-validator";
import { Express } from "express";
import { FSDatabase } from "database";
import { Grid } from "grid";
import { getCellProbas, dico, getCellBest, getCellProbas2 } from "../search";
/**
 * Controller for CRUD operations on words
 */
export default function wordController({
  app,
  db,
}: {
  app: Express;
  db: FSDatabase;
}) {
  let uuid = 1;
  let currLocale = "fr-fr";
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
    uuid += 1;
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
    uuid += 1;
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

  app.get("/word/hash", async (req, res) => {
    res.send({ uuid, locale: currLocale });
  });

  /**
   * Returns the list of unexisting words in the grid
   */
  app.post("/word-check", async (req, res) => {
    const words = await dico.getWordsMap();
    const grid = Grid.unserialize(req.body.grid);
    if (!grid) return res.sendStatus(400);
    res.send(grid.check(words));
  });

  /**
   * Set locale
   */
  app.post("/set-locale", async (req, res) => {
    const { locale } = req.body;
    if (locale === dico.locale) return res.sendStatus(200);
    if (["fr-fr", "en-en", "es-es"].indexOf(locale) === -1)
      return res.sendStatus(400);
    dico
      .setLocale(locale)
      .then(() => db.getWords())
      .then((words) => {
        dico.addWordsToDictionnary(words);
        currLocale = locale;
      })
      .then(() => res.sendStatus(200));
  });

  // app.post("/heatmap", async (req, res) => {
  //   await dico.getWords();
  //   const grid = Grid.unserialize(req.body.grid);
  //   if (!grid) return res.sendStatus(400);
  //   console.time("getCellProbas");
  //   const ht = getCellProbas(grid);
  //   console.timeEnd("getCellProbas");
  //   res.send(ht);
  // });

  app.post("/heatmap", async (req, res) => {
    await dico.getWords();
    const grid = Grid.unserialize(req.body.grid);
    if (!grid) return res.sendStatus(400);
    console.time("getCellProbas");
    const ht = getCellProbas(grid);
    console.timeEnd("getCellProbas");
    console.time("getCellBest");
    const cellBest = getCellBest(grid, ht);
    console.timeEnd("getCellBest");
    console.time("getCellProbas2");
    const ht2 = getCellProbas2(grid);
    console.timeEnd("getCellProbas2");

    res.send(cellBest);
  });
}
