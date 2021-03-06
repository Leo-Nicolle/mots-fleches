import search from "../search";
let isBusy = false;
export default function wordController({ app, db }) {
  app.get("/dico", async (req, res) => {
    const words = await db.getWords();
    res.send(words);
  });
  app.post("/search", async (req, res) => {
    const { grid, isDefinition, coord, ordering, dir, query, method, max } =
      req.body;
    if (isBusy) {
      return res.sendStatus(202);
    }
    isBusy = true;
    try {
      const { words, cells, impossible } = await search.findWords({
        grid,
        isDefinition,
        method,
        coord,
        dir,
        query,
      });
      isBusy = false;
      const wordsToSend =
        ordering === "DSC"
          ? words
              .slice(Math.max(0, words.length - max))
              .sort((a, b) => b.localeCompare(a))
          : words.slice(0, max).sort((a, b) => a.localeCompare(b));
      res.send({
        method,
        nbRestuls: words.length,
        words: wordsToSend,
        cells,
        impossible,
      });
    } catch (e) {
      isBusy = false;
      console.error(e);
      res.status(500).send(e);
    }
  });
}
