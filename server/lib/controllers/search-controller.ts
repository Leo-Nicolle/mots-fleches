import { Express } from "express";
import { FSDatabase } from "database";
import { search, dico, getBestWords } from "../search";

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
  db: FSDatabase;
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


  app.post("/search-proba", async (req, res) => {
    const { gridId, cellProbas, coord, dir, max } = req.body;
    const grid = await db.getGrid(gridId);
    if (!grid) {
      return res.sendStatus(203);
    }
    if (!cellProbas || cellProbas.length !== grid.rows) {
      return res.sendStatus(203);
    }
    await dico.loadDictionary();
    console.time("bestWords");
    // const bestWords = getBestWords(grid, cellProbas, coord, dir);
    console.timeEnd("bestWords");
    // res.send({ nbResults: bestWords.length
    // , words: bestWords.slice(0, max) });
    res.send({ nbResults: 0, words: [] });
  });
}
