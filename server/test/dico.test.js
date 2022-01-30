import dico from "../lib/search/dico";
const fs = require("fs").promises;
const chai = require("chai");
const { expect } = chai;

let baseWordsCount = 2;
let baseWords;
const newWord = "grezo";
const deleteWord = "zooo";

function getExpected(words, excludeList = []) {
  return words.reduce((acc, word, wordIndex) => {
    if (excludeList.includes(word)) return acc;
    for (let letterIndex = 0; letterIndex < word.length - 1; letterIndex++) {
      const subWord = word.slice(letterIndex, letterIndex + 2);
      if (!acc[subWord.toUpperCase()]) {
        acc[subWord.toUpperCase()] = {};
      }
      if (!acc[subWord.toUpperCase()][letterIndex]) {
        acc[subWord.toUpperCase()][letterIndex] = new Set();
      }
      acc[subWord.toUpperCase()][letterIndex].add(wordIndex);
    }
    return acc;
  }, {});
}
describe("Database", () => {
  before(() => {
    return dico
      .loadDictionary()
      .then(() => fs.readFile(process.env.APP_CROSSWORDS_DICO_PATH, "utf8"))
      .then((data) => {
        baseWords = data.split(",");
      });
  });

  it("should read the words from text files", () => {
    expect(dico.words.length).equal(baseWordsCount);
    expect(dico.wordsMap.size).equal(baseWordsCount);
    const expected = getExpected(baseWords);
    expect(dico.occurencies[0]).to.deep.equal(expected);
  });
  it("should be able to add words", () => {
    dico.addWordsToDictionnary(newWord);
    expect(dico.words.length).equal(baseWordsCount + 1);
    expect(dico.wordsMap.size).equal(baseWordsCount + 1);
    const expected = getExpected([...baseWords, newWord]);
    expect(dico.occurencies[0]).to.deep.equal(expected);
  });

  it("should be able to delete words", () => {
    return dico.removeWordsFromDictionary(deleteWord).then(() => {
      // we dont remove it from the words array, it would be a mess
      expect(dico.words.length).equal(baseWordsCount + 1);
      // But we remove it from the wordsMap
      expect(dico.wordsMap.size).equal(baseWordsCount);

      const expected = getExpected(
        [...baseWords, newWord, deleteWord],
        [deleteWord]
      );
      expect(dico.occurencies[0]).to.deep.equal(expected);
    });
  });
});
