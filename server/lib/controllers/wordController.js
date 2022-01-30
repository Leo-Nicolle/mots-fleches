import { body, validationResult } from "express-validator";
import dico from "../search/dico";

export default function wordController({ app, db }) {
  app.get("/word", async (req, res) => {
    const words = await db.getWords();
    res.send(words);
  });

  app.post("/word", [body("word").isString().notEmpty()], async (req, res) => {
    const word = req.body.word.trim();
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
    dico.addWordsToDictionnary([word], true);
    res.sendStatus(200);
    res.send();
  });
  app.delete("/word/:word", async (req, res) => {
    const word = req.params.word.trim();
    await db.deleteWord(req.params.word);
    dico.removeWordsFromDictionary([word]);
    res.sendStatus(200);
  });
}
