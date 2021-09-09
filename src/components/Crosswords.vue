<template>
<div class="container" @keypress="onKeyPress">
  <div class="crosswords">
    <div v-for="(row,i) in cellValues" class="row" :key="i">
      <div v-for="(col,j) in row" :key="j" class="cell">
        <textbox
          v-model="cells[getCoords(i,j)]"
          @click="onClick(i,j)"
          @input="onChange(i,j)"
          @keypress="onKeyPress">
        </textbox>
      </div>
    </div>
  </div>
  <Suggestions :suggestions="suggestions" :direction="direction" @switchdirection="onSwitchDirection" @wordhover="onWordHover" />
</div>
</template>

<script>
import Crosswords from '../js/Crosswords';
import Suggestions from './Suggestions.vue';
import textbox from './textbox.vue';

const crosswords = new Crosswords();

export default {
  name: 'Crosswords',
  data() {
    return {
      rows: 10,
      cols: 10,
      cells: {},
      direction: 'horizontal',
      cellValues: [],
      suggestions: [],
      selectedCells: [],
    };
  },
  watch: {
    rows() {
      this.setupCells();
    },
    cols() {
      this.setupCells();
    },
  },
  computed: {

  },
  mounted() {
    this.setupCells();
    this.refresh();
  },
  methods: {
    getCoords(row, col) {
      return `${row},${col}`;
    },
    setupCells() {
      this.cells = new Array(this.rows).fill(0).map(() => new Array(this.cols).fill(''))
        .reduce((acc, row, i) => {
          row.forEach((cell, j) => {
            const coords = this.getCoords(i, j);
            acc[coords] = this.cells[coords] || '';
          });
          return acc;
        }, {});
    },
    getCellValues() {
      const res = new Array(this.rows).fill(0).map(() => new Array(this.cols).fill(''));
      Object.entries(this.cells)
        .forEach(([coord, value]) => {
          const [row, col] = coord.split(',');
          res[row][col] = value;
        });
      return res;
    },
    refresh() {
      this.cellValues = this.getCellValues();
    },
    onChange(row, col) {
      const coords = this.getCoords(row, col);
      const value = this.cells[coords];
      this.cells[coords] = value.slice(value.length - 1);
      this.refresh();
    },
    onClick(row, col) {
      crosswords.findWords({
        grid: this.cellValues,
        coord: {
          x: col,
          y: row,
        },
        dir: this.direction,
      }).then(({
        words,
        cells,
      }) => {
        this.suggestions = words.slice(0, 50);
        this.selectedCells = cells;
      });
    },
    onKeyPress(evt) {
      console.log(evt);
    },
    onSwitchDirection() {
      console.log('ICI', this.direction);
      if (this.direction === 'horizontal') {
        this.direction = 'vertical';
      } else {
        this.direction = 'horizontal';
      }
    },
    onWordHover(word) {
      this.selectedCells.forEach(({
        x,
        y,
      }, i) => {
        this.cells[this.getCoords(y, x)] = word.slice(i, i + 1);
      });
    },
  },
  components: {
    textbox,
    Suggestions,
  },

};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>
.container {
  display: flex;
}

.row {
  display: flex;
  margin-bottom: 20px;
  width: 100%;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-evenly;
  align-items: center;
  align-content: center;
}

.input-letter {
  min-width: 46px;
  max-width: 46px;

  padding: 0;
  min-height: 46px;
  text-align: center;
  text-overflow: clip;
}
</style>
