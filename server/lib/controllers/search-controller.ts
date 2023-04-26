import { Express } from "express";
import { Database } from "../database";
import { search, dico } from "../search";

let isBusy = false;

/**
 * Controller for search operations
 * It can handle only a single request at a time
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
  app.get("/dico", async (req, res) => {
    const words = await db.getWords();
    res.send(words);
  });
  /**
   * Get a list of sugestions
   */
  app.post("/search", async (req, res) => {
    const { gridId, coord, ordering, dir, method, max } = req.body;
    if (isBusy) {
      return res.sendStatus(202);
    }
    const grid = await db.getGrid(gridId);
    if (!grid) {
      return res.sendStatus(203);
    }
    isBusy = true;
    try {
      const { words, cells, impossible } = await search.findWords({
        grid,
        method,
        coord,
        dir,
      });
      isBusy = false;
      const wordsToSend =
        ordering === -1
          ? words
              .slice(Math.max(0, words.length - max))
              .sort((a, b) => b.localeCompare(a))
          : words.slice(0, max).sort((a, b) => a.localeCompare(b));

      res.send({
        method,
        nbResults: words.length,
        words: wordsToSend,
        cells,
        impossible,
      });
    } catch (e) {
      console.log("Errore", e);
      isBusy = false;
      // console.error(e);
      res.status(500).send(e);
    }
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
      })
      .then(() => res.sendStatus(200));
  });
}
