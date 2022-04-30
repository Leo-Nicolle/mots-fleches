
import {Position, Lookup, DefGrid, LetterGrid} from './types';

const ACode = 'A'.charCodeAt(0);
type GWord = {
  start: Position,
  end: Position,
  length: number,
  letters: Letter[]
};
type Letter = string  & { length: 1 };
type Lemme = string  & { length: 2 };

type lengthLookup = Lookup<number[]>;
type indexLookup = Lookup<lengthLookup>;
type positionLookup = Lookup<boolean>;

type Dico = { [key: Lemme]: indexLookup };
type WildCards = indexLookup[][];

type Constraint = {
  // index of the letter in the word
  index: number;
  // letter imposed
  letter: Letter;
  // position of the constraint within the perpandicular word
  position: number;
}
type ImposedLetter = {
  imposedLetter: Letter;
  // position of the imposed letter from the new word start position
  position: number;
}


function strToPos(str: string): Position{
  const [x, y] = str.split(',');
  return {
    x: +x,
    y: +y
  };
}

function posToStr(pos: Position): string{
  return `${pos.x},${pos.y}`;
}

export function getWord({ vec, defGrid, lGrid, pos, lookup }: {
  vec: Position,
  defGrid: DefGrid,
  lGrid: LetterGrid,
  pos: Position,
  lookup: positionLookup
 }): GWord {
   let { x, y } = pos;
   const word: GWord = {
     start: pos,
     length: 0,
     letters: [],
     end: pos
   };
   while (defGrid[y] && defGrid[y][x] === false) {
     lookup[posToStr({x, y})] = true;
     word.letters.push(lGrid[y][x]);
     word.length++;

     x += vec.x;
     y += vec.y;
   }
   return {
    ...word,
    end: {x: x-vec.x, y: y - vec.y}
   };
 }

class Generator {
  
  public words: String[];
  public dico: Dico;
  public firstWildCard: WildCards;
  public secondWildCard: WildCards;


  constructor() {
    this.words = [];
    this.dico = new Array(26).fill(0).reduce((acc, e, i) => {
      const firstLetter = String.fromCharCode(ACode + i);
      new Array(26).fill(0).forEach((_, j) => {
        const secondLetter = String.fromCharCode(ACode + j);
        acc[firstLetter + secondLetter] = {};
      });
      return acc;
    }, {});
    const dicoKeys = Object.keys(this.dico);
    this.firstWildCard = new Array(26).fill(0)
      .map((e, i) => dicoKeys
        .filter((e, j) => j % 26 === i)
        .map((key) => this.dico[key as Lemme]));
    this.secondWildCard = new Array(26).fill(0)
      .map((e, i) => dicoKeys
        .slice(i * 26, (i + 1) * 26)
        .map((key) => this.dico[key as Lemme]));
  }

  addToDico(word: String) {
    word = word.trim().toUpperCase();
    if (!word.match(/^\w+$/)) return;
    this.words.push(word);
    const wordIndex = this.words.length - 1;
    const letters = word.split('');
    letters.slice(1).forEach((l2, i) => {
      const l1 = letters[i];
      const byIndex = this.dico[(l1 + l2) as Lemme];
      if (!byIndex) return;
      if (!byIndex[i]) {
        byIndex[i] = {};
      }
      const byLength = byIndex[i];
      if (!byLength[word.length]) {
        byLength[word.length] = [];
      }
      byLength[word.length].push(wordIndex);
    });
  }

  getBestLetters({
    wildCardPosition = 0, imposedLetter = 'A' as Letter, wordLength = 5, position = 0,
    constraints = [],
  }: {
    wildCardPosition: number,
    imposedLetter: Letter,
    wordLength: number,
    position: number,
    constraints: Constraint[]
  }) {
    const records = (wildCardPosition === 0 ? this.firstWildCard : this.secondWildCard)[imposedLetter.charCodeAt(0) - ACode];
    return new Array(26).fill(0).map((e, i) => {
      const a =records;
      console.log(a);
      try {
        return {
          letterIndex: i,
          wordsIndexes: records[i][position][wordLength].filter((wordIndex) => this.satisfiesConstraints(wordIndex, constraints)),
        };
      } catch (e) { return {letterIndex: -1, wordsIndexes: []}; }
    })
      .filter((e) => e.wordsIndexes.length)
      .sort((a, b) => b.wordsIndexes.length - a.wordsIndexes.length)
      .map((e) => [String.fromCharCode(ACode + e.letterIndex), e.wordsIndexes.map((i) => this.words[i])]);
  }

  satisfiesConstraints(wordIndex: number, constraints = [] as Constraint[]) {
    return constraints.every(({ index, letter }) => this.words[wordIndex][index] === letter);
  }

  getBestWords({
    wordLength = 5, previousLetters = [], nextLetters = [], constraints = [],
  } :{
    wordLength: number,
    previousLetters: ImposedLetter[],
    nextLetters: ImposedLetter [],
    constraints: Constraint[] 
  }) {
    const bestPrevious = previousLetters.map(({ imposedLetter, position }, i) => this.getBestLetters({
      wildCardPosition: 1, 
      imposedLetter, 
      position, 
      wordLength,
      constraints: constraints.filter(({position}) =>position === i)
    }));
    const bestNext = nextLetters.map(({ imposedLetter, position }, i) => this.getBestLetters({
      wildCardPosition: 0, imposedLetter, position, wordLength,
      constraints: constraints.filter(({position}) =>position === i)
    }));

  }

  getSlots(defGrid: DefGrid, lGrid: LetterGrid){

    const visitedH:positionLookup  = {};
    const visitedV:positionLookup  = {};
    const wordsH: GWord[] = [];
    const wordsV: GWord[] = [];

    defGrid.forEach((row, y) => {
      row.forEach((col, x) => {
        const pos = {x,y};
        if (!visitedH[posToStr(pos)]){
          wordsH.push(getWord({ pos,vec: {x: 1, y: 0}, defGrid, lGrid, lookup: visitedH }));
        }
        if (!visitedV[posToStr(pos)]){
          wordsV.push(getWord({ pos,vec: {x: 0, y: 1}, defGrid, lGrid,  lookup: visitedV }));
        }
      });
    });
    return {wordsH: wordsH.filter(({length}) => length > 1), wordsV: wordsV.filter(({length}) => length > 1)};
  }

  run(isDefinition: DefGrid, grid: LetterGrid) {
    console.log(this.dico, isDefinition);

    console.log(this.getSlots(isDefinition, grid));

    // over all the grid: 
    //  find the possibilites for each word
    // assing to the position with the less remaining possibilities the best words.


    

  }
}

const generator = new Generator();
export default generator;
