
import { body, validationResult } from 'express-validator';
import crosswords from './Crosswords';


export default function wordController({ app, db }) {

  app.get('/dico',async (req, res) => {
    const words = await db.getWords();
    res.send(words);
  });
  app.post('/search',async (req, res) => {
    const 
      {
        grid,
        isDefinition,
        coord,
        dir,
        query,
        max
      } = req.body;
    const {words,cells, impossible }  = await crosswords.findWords({
      grid,
      isDefinition,
      coord,
      dir,
      query,
    })
    res.send({words: words.slice(0,max), cells,impossible});
  });

}
