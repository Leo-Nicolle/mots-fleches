
import { body, validationResult } from 'express-validator';
import crosswords from './Crosswords';


export default function wordController({ app, db }) {

  app.get('/dico', async (req, res) => {
    const words = await db.getWords();
    res.send(words);
  });
  app.post('/search', async (req, res) => {
    const
      {
        grid,
        isDefinition,
        coord,
        ordering,
        dir,
        query,
        max
      } = req.body;
    const { words, cells, impossible } = await crosswords.findWords({
      grid,
      isDefinition,
      coord,
      dir,
      query
    })
    console.log("ORDERING", ordering)
    const wordsToSend =
      ordering === 'DSC'
        ? words.slice(Math.max(0, words.length - max))
               .sort((a, b) => b.localeCompare(a))
        : words.slice(0, max)
               .sort((a, b) => a.localeCompare(b));
    res.send({ nbRestuls: words.length, words: wordsToSend, cells, impossible });
  });

}
