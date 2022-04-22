const ACode = 'A'.charCodeAt(0);

type Lookup<T> = { [key: number]: T };
type Letter = string  & { length: 1 };
type Lemme = string  & { length: 2 };


type lengthLookup = Lookup<number[]>;
type indexLookup = Lookup<lengthLookup>;

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
      console.log(a)
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
}

const generator = new Generator();
export default generator;
