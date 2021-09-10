<template>
<div class="container section" @keyup="onKeyUp">
  <div class="crosswords">
    <div v-for="(row,i) in cellValues" class="columns" :key="i">
      <div v-for="(col,j) in row" :key="j" class="column is-narrow cell">
        <textbox
          v-model="cells[getCoords(i,j)]"
          @click="onClick(i,j)"
          @input="onChange(i,j)"
          :highlighted="isHighlighted(i,j)"
          >
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
  props: ['rows', 'cols'],
  data() {
    return {
      cells: {},
      direction: 'horizontal',
      cellValues: [],
      suggestions: [],
      focusedCell: null,
      selectedCells: [],
    };
  },
  watch: {
    rows() {
      this.setupCells();
      this.refresh();
    },
    cols() {
      this.setupCells();
      this.refresh();
    },
  },
  computed: {

  },
  mounted() {
    this.setupCells();
    // window.addEventListener('keyup', (e) => {
    //   console.log(e.keyCode);
    // });
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
      if (!coords) return;
      const value = this.cells[coords];
      this.cells[coords] = value ? value.slice(value.length - 1) : '';
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
        this.suggestions = words.slice(0, 100).map((word) => ({ word }));
        this.selectedCells = cells;
        this.focusedCell = { x: col, y: row };
      });
    },
    onKeyUp(evt) {
      if (!this.focusedCell) {
        this.focusedCell = { x: 0, y: 0 };
      }
      const children = [...this.$el.querySelectorAll('.cell input')];
      const evtIndex = children.findIndex((c) => c === evt.target);
      if (evtIndex < 0) return;
      let col = evtIndex % this.cols;
      let row = Math.floor(evtIndex / this.cols);

      if (evt.code === 'ArrowDown') {
        row = Math.min(this.rows - 1, row + 1);
      }
      if (evt.code === 'ArrowUp') {
        row = Math.max(0, row - 1);
      }
      if (evt.code === 'ArrowRight') {
        col = Math.min(this.cols - 1, col + 1);
      }
      if (evt.code === 'ArrowLeft') {
        col = Math.max(0, col - 1);
      }
      children[col + row * this.cols].focus();
      this.focusedCell = { x: col, y: row };
    },
    onSwitchDirection() {
      if (this.direction === 'horizontal') {
        this.direction = 'vertical';
      } else {
        this.direction = 'horizontal';
      }
      if (this.focusedCell) {
        this.onClick(this.focusedCell.y, this.focusedCell.x);
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
    isHighlighted(row, col) {
      if (!this.selectedCells.length) return false;
      return !!this.selectedCells.find((cell) => cell.x === col && cell.y === row);
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
.cell{
  padding: 4px;
}
</style>
