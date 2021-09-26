import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { existsSync } from 'fs';
import db from './database';
import wordController from './wordController';
import gridController from './gridController';
import searchController from './search-controller';
import crosswords from './Crosswords';

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (existsSync('public')) {
  console.log('server static');
  app.use(express.static('public'));
}
db.getWords().then((words) => {
  crosswords.addWordsToDictionnary(words)
})
wordController({  app, db });
gridController({  app, db });
searchController({ app, db });

if (require.main === module) {
  const server = app.listen(+process.env.APP_CROSSWORDS_PORT || 3010, () => {
    console.log(
      `server running at port http://localhost/${server.address().port}`,
    );
  });
}
export default app;
