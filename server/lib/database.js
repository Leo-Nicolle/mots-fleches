
import fs from "fs/promises"
import { constants } from "fs"
import path from "path"

class Database {

  constructor(){
    this.words = [];
    this.grids = [];
    this.loadingPromise = Promise.all([
      this.loadFile(process.env.WORDS_PATH),
      this.loadFile(process.env.GRIDS_PATH),
    ])
    .then(([words, grids]) => {
      this.words = words.split(',').map(w => w.trim()).filter(e => e.length)
      this.grids = grids && grids.length ?  JSON.parse(grids) : [];
    })
  }

  loadFile(file){
    return fs.mkdir(path.dirname(file), {recursive: true})
    .then(() => fs.access(file, constants.F_OK))
    .catch((e) => e.message.includes(file) ?  fs.writeFile(file, file.match(/\.json/) ? '[]' : '') : Promise.reject(e))
    .then(() => fs.readFile(file,'utf-8'))
  }

  getWords(){
    return this.loadingPromise.then(() => this.words)
  }
  saveWords(){
    return this.getWords()
    .then((words) => fs.writeFile(process.env.WORDS_PATH, words.join(',')))
  }
  pushWord(word){
    return this.getWords()
    .then(words => {
      words.push(word);
      return this.saveWords();
    })
  }
  deleteWord(word){
    return this.getWords()
    .then(words => {
      this.words = words.filter(w => word.localeCompare(w));
      return this.saveWords();
    })
  }

  getGrids(){
    return this.loadingPromise.then(() => this.grids)
  }

  getGrid(id){
    return this.getGrids()
    .then(grids => grids.find(grid => grid.id === id));
  }

  saveGrids(){
    return this.getGrids()
    .then((grids) => fs.writeFile(process.env.GRIDS_PATH, JSON.stringify(grids)))
  }
  pushGrid(grid){
    return this.getGrids()
    .then(grids => {
      grids.push(grid);
      return this.saveGrids();
    })
  }
  updateGrid(grid){
    return this.getGrids()
    .then(grids => {
      const oldGrid = grids.find(({id}) => id === grid.id);
      const newGrid = {
        ...oldGrid, 
        ...grid
      }
      this.grids = this.grids.filter(({id}) => id !== grid.id);
      this.grids.push(newGrid);
      return this.saveGrids();
    })
  }
  deleteGrid(gridId){
    return this.getGrids()
    .then(grids => {
      this.grids = grids.filter(({id}) => id !== gridId);
      return this.saveGrids();
    })
  }
}

const db = new Database();

export default db;
