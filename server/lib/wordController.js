
import { body, validationResult } from 'express-validator';
import crosswords from './Crosswords';


export default function wordController({ app, db }) {

  app.get('/word',async (req, res) => {
    const words = await db.getWords();
    res.send(words);
  });

  app.post(
    '/word',
    [body('word').isString().notEmpty()],
    async (req, res) => {
      const word = req.body.word.trim();
      const errors = validationResult(req);
      const exists = (await db.getWords()).find(w => !w.localeCompare(word))

      if(exists){
        return res.status(500).json({ errors: [{msg:'exists already'}] });
      }
      if (!errors.isEmpty()) {
        return res.status(500).json({ errors: errors.array() });
      }
      try {
        await db.pushWord(word);
      }catch (e) {
        return res.status(500).send(e.message);
      }
      crosswords.addWordsToDictionnary([word])
      res.sendStatus(200);
    },
  );
  app.delete('/word/:word',  async (req, res) => {
    await db.delete(req.params.word)
    res.sendStatus(200);
  });
}
