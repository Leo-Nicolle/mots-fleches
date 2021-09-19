import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { existsSync } from 'fs';
import db from './database';
import wordController from './wordController';
import gridController from './gridController';

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (existsSync('public')) {
  console.log('server static');
  app.use(express.static('public'));
}

wordController({  app, db });
gridController({  app, db });


if (require.main === module) {
  const server = app.listen(process.env.PORT || 3010, () => {
    console.log(
      `server running at port http://localhost/${server.address().port}`,
    );
  });
}
export default app;
