
import fs from "fs/promises"
import { constants } from "fs"
import path from "path"

class Database {

  constructor(){
    this.words = []
    this.loaddingPromise = fs.mkdir(path.dirname(process.env.DB_PATH), {recursive: true})
    .then(() => fs.access(process.env.DB_PATH, constants.F_OK))
    .catch((e) => e.message.includes(process.env.DB_PATH) ?  fs.writeFile(process.env.DB_PATH, "") : Promise.reject(e))
    .then(() => fs.readFile(process.env.DB_PATH,'utf-8'))
    .then(data => {
      console.log(data, typeof data)
        // this.words = []
      this.words = data.split(',').map(w => w.trim()).filter(e => e.length)
  
    })
  }

  getWords(){
    return this.loaddingPromise.then(() => this.words)
  }
  save(){
    return this.getWords()
    .then((words) => fs.writeFile(process.env.DB_PATH, words.join(',')))
  }
  push(word){
    return this.getWords()
    .then(words => {
      words.push(word);
      return this.save();
    })
  }
  delete(word){
    return this.getWords()
    .then(words => {
      this.words = words.filter(w => word.localeCompare(w));
      return this.save();
    })

  }

}

const db = new Database();

export default db;
