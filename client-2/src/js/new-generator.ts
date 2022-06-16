
import {Vec, Lookup, DefGrid, LetterGrid} from './types';
import {add, subtract, dot} from './utils';

const ACode = 'A'.charCodeAt(0);
interface Slot {
  start: Vec;
  end: Vec;
  length: number;
  letters: {letter: Letter, index: number}[];
}
type Letter = string  & { length: 1 };
type Lemme = string  & { length: 2 };

type lengthLookup = Lookup<number[]>;
type indexLookup = Lookup<lengthLookup>;
type slotLookup = Lookup<Slot>;

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
type BestLetter = {
  letterIndex: number;
  wordsIndexes: number[];
}


function strToPos(str: string): Vec{
  const [x, y] = str.split(',');
  return {
    x: +x,
    y: +y
  };
}

function posToStr(pos: Vec): string{
  return `${pos.x},${pos.y}`;
}

export function getSlot({ vec, defGrid, lGrid, pos, lookup }: {
  vec: Vec,
  defGrid: DefGrid,
  lGrid: LetterGrid,
  pos: Vec,
  lookup: slotLookup
 }): Slot {
   let { x, y } = pos;
   const word: Slot = {
     start: pos,
     length: 0,
     letters: [],
     end: pos
   };
   while (defGrid[y] && defGrid[y][x] === false) {
     lookup[posToStr({x, y})] = word;
     if (lGrid[y][x].length){
       word.letters.push({
         letter: lGrid[y][x],
         index: word.length
       });
     }
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
  }): BestLetter[] {
    const records = (
      wildCardPosition === 0 
      ? this.firstWildCard 
      : this.secondWildCard)[imposedLetter.charCodeAt(0) - ACode];
    return new Array(26).fill(0).map((e, i) => {
      try {
        return {
          letterIndex: i,
          wordsIndexes: records[i][position][wordLength]
            .filter((wordIndex) => this.satisfiesConstraints(wordIndex, constraints)),
        };
      } catch (e) { return {letterIndex: -1, wordsIndexes: []}; }
    })
      .filter((e) => e.wordsIndexes.length)
      .sort((a, b) => b.wordsIndexes.length - a.wordsIndexes.length);
      // .map((e) => [String.fromCharCode(ACode + e.letterIndex), e.wordsIndexes.map((i) => this.words[i])]);
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

    const lookupH:slotLookup  = {};
    const lookupV:slotLookup  = {};
    const slotsH: Slot[] = [];
    const slotsV: Slot[] = [];
    // get all the words:
    defGrid.forEach((row, y) => {
      row.forEach((col, x) => {
        const pos = {x,y};
        if (!lookupH[posToStr(pos)]){
          const word = getSlot({ pos,vec: {x: 1, y: 0}, defGrid, lGrid, lookup: lookupH }); 
          if (word.length > 1){
            slotsH.push(word);
          }
        }
        if (!lookupV[posToStr(pos)]){
          const word = getSlot({ pos,vec: {x: 0, y: 1}, defGrid, lGrid,  lookup: lookupV });
          if (word.length > 1){
            slotsV.push(word);
          }
        }
      });
    });

    // get the candidates for each word: 
    return {slotsH, slotsV, lookupH, lookupV};
    // return {wordsH: wordsH.filter(({length}) => length > 1), wordsV: wordsV.filter(({length}) => length > 1)};
  }

  getNeighborValid(position: Vec, perp: Vec, defGrid: DefGrid){
    return [
      add(position, perp),
      subtract(position, perp)
    ].filter(({x,y}) => 
      y < defGrid.length
      && y >= 0 
      && x < defGrid[0].length 
      && x >= 0
      && !defGrid[y][x]
    );
  }

  /**
   * try to place a word within the best spot 
   */
  placeWord(word: string, defGrid: DefGrid, lGrid: LetterGrid ){
    let {slotsH, slotsV, lookupH, lookupV} = this.getSlots(defGrid, lGrid);
    slotsH = slotsH.filter(({length}) => length === word.length)
      .map(p => ({
        ...p,
        dir: {x: 1, y: 0},
        lookup: lookupH,
        perpLookup: lookupV

      }));
    slotsV = slotsV.filter(({length}) => length === word.length)
      .map(p => ({
        ...p,
        dir: {x: 0, y: 1},
        lookup: lookupV,
        perpLookup: lookupH
      }));

    interface Candidatate extends Slot {
      dir: Vec;
      lookup: slotLookup;
      perpLookup: slotLookup;

    }

    const possibilities = ([...slotsH, ...slotsV] as Candidatate[])
      .map(candidate => {
        const perp = {x: candidate.dir.y , y: candidate.dir.x };
        word.split('')
        .forEach((letter, index) => {
          const current = {
            x: candidate.start.x + index * candidate.dir.x,
            y: candidate.start.y + index * candidate.dir.y
          } as Vec;
          this.getNeighborValid(current, perp, defGrid)
          .forEach(neighbor => {
            const perpC = candidate.perpLookup[posToStr(neighbor)];
            const constraints = perpC.letters.map(e => ({
              ...e,
              // dont need position
              position: -1,
            }));
            const bestLetters = this.getBestLetters({
              // 1 => 0
              // -1 => 1
              wildCardPosition: Math.max(0, -dot(subtract(neighbor, current), perp)), 
              imposedLetter: letter as Letter, 
              position: index, 
              wordLength: perpC.length,
              constraints
            });
            return bestLetters.reduce((total, l) =>total + l.wordsIndexes.length , 0);
            console.log({bestLetters});
          });
        });
      });

  }

  computeProbsGrid(defGrid: DefGrid, lGrid: LetterGrid){
    // get the empty spots next to 
  }

  run(defGrid: DefGrid, lGrid: LetterGrid) {
    // console.log(this.dico, defGrid);
    this.placeWord('COUCOU', defGrid, lGrid);
    // console.log(this.getSlots(defGrid, grid));

    // over all the grid: 
    //  find the possibilites for each word
    // assing to the position with the less remaining possibilities the best words.


    

  }
}


/*

    wordsH
    .forEach(word => {
      const bestLetters = new Array(word.length)
      .fill(0)
      .map((_, index) => {
        const current = {x: word.start.x + index, y: word.start.y} as Vec;
        const perp = visitedV[posToStr(current)];
        let constraints:Constraint[] = [];
        if (perp.length > 1){
          constraints = perp.letters.map(e => ({
            index,
            position: e.index,
            letter: e.letter
          }));
        }
        type NeighboorSquares = {
          x: number, y: number, valid?: boolean, letter?: boolean | string,
          wildCardPosition: 0 | 1 | -1};

        const neighboorSquares: NeighboorSquares[] = ([
          {x: current.x, y: current.y - 1, wildCardPosition: 0},
          {x: current.x, y: current.y + 1, wildCardPosition: 1},
        ] as NeighboorSquares[]).map(c => {
          c.valid = c.x > 0 && c.y >=0 && c.x < width && c.y < height && !defGrid[c.y][c.x];
          const charCode = c.valid && lGrid[c.y][c.x].charCodeAt(0);
          c.letter =  charCode >= ACode && charCode < ACode+ 26;
          c.wildCardPosition = c.valid ? c.wildCardPosition:  -1;
          return c;
        })
        .filter(c => c.valid);

        if (neighboorSquares.length){
          const bestLetters = this.getBestLetters({
              wildCardPosition: neighboorSquares[0].wildCardPosition, 
              imposedLetter: neighboorSquares[0].letter as Letter, 
              position: index, 
              wordLength: word.length,
              constraints
            });
        }else{

        }
      });
      // word.bestLetter = word.letters.forEach()
      // 
    });

*/

const generator = new Generator();
export default generator;
