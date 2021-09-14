<template>
<div class="container section columns" @keyup="onKeyUp">
  <Suggestions
    :suggestions="suggestions"
    :direction="direction"
    :query="query"
    :loading="loadingSuggestions"
    @switchdirection="onSwitchDirection"
    @wordhover="onWordHover"
    @search="onSearch"
    class="column"
  />
  <div class="crosswords column scrollbar">
    <div v-for="(row,i) in cellValues" class="columns" :key="i">
      <div v-for="(col,j) in row" :key="j" class="column is-narrow cell">
        <textbox
          @click="onSelectCell(i, j)"
          @switch="onSwitch($event, i, j)"
          @type="onType($event,i, j)"
          :value="col"
          :highlighted="isHighlighted(i,j)"
          >
        </textbox>
      </div>
    </div>
  </div>
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
      loadingSuggestions: false,
      findWordPromise: Promise.resolve(),
      query: '',
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
    focusedCell() {
      this.searchSuggestions();
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
    isHighlighted(row, col) {
      if (!this.selectedCells.length) return false;
      return !!this.selectedCells.find((cell) => cell.x === col && cell.y === row);
    },
    moveCursor(direction) {
      const children = [...this.$el.querySelectorAll('.cell input')];
      const focused = document.activeElement;
      const evtIndex = children.findIndex((c) => c === focused);
      if (evtIndex < 0) return;
      const col = evtIndex % this.cols;
      const row = Math.floor(evtIndex / this.cols);
      const newCol = Math.max(Math.min(col + direction.y, this.cols - 1), 0);
      const newRow = Math.max(Math.min(row + direction.x, this.rows - 1), 0);
      children[newCol + newRow * this.cols].focus();
      this.refresh();
      this.query = '';
      this.focusedCell = {
        x: newCol,
        y: newRow,
      };
    },
    searchSuggestions() {
      if (!this.focusedCell) return Promise.resolve();
      this.findWordPromise = this.findWordPromise.then(() => {
        this.loadingSuggestions = true;
        return new Promise((resolve) => setTimeout(() => resolve(), 200))
          .then(() => crosswords.findWords({
            grid: this.cellValues,
            coord: {
              x: this.focusedCell.x,
              y: this.focusedCell.y,
            },
            dir: this.direction,
            query: this.query,
          }));
      }).then(({
        words,
        cells,
        query,
      }) => {
        if (!words) return;
        this.loadingSuggestions = false;
        this.suggestions = words.slice(0, 100).map((word) => ({ word }));
        this.selectedCells = cells;
        this.query = query;
      }).catch((e) => {
        this.selectedCells = [];
        this.suggestions = [];
        this.loadingSuggestions = false;
      });
      return this.findWordPromise;
    },
    onSelectCell(row, col) {
      const coords = this.getCoords(row, col);
      if (!coords) return;
      const value = this.cells[coords];
      this.cells[coords] = value ? value.slice(value.length - 1) : '';
      this.focusedCell = { x: col, y: row };
    },
    onSwitch(isDefinition, row, col) {
      const newChar = isDefinition
        ? String.fromCharCode(10)
        : '';
      const coords = this.getCoords(row, col);
      this.cells[coords] = newChar;
      this.selectedCells = [];
      this.refresh();
    },
    onType(evt, row, col) {
      const coords = this.getCoords(row, col);
      this.cells[coords] = evt;
    },
    onKeyUp(evt) {
      if (!this.focusedCell) {
        this.focusedCell = { x: 0, y: 0 };
      }
      let y = 0;
      let x = 0;

      if (evt.code === 'ArrowDown') {
        x = 1;
      } else if (evt.code === 'ArrowUp') {
        x = -1;
      } else if (evt.code === 'ArrowRight') {
        y = 1;
      } else if (evt.code === 'ArrowLeft') {
        y = -1;
      } else if (evt.code === 'Backspace') {
        if (this.direction === 'horizontal') {
          y = -1;
        } else {
          x = -1;
        }
      } else if (evt.key.match(/\w/)) {
        if (this.direction === 'horizontal') {
          y = 1;
        } else {
          x = 1;
        }
      }

      if (x === 0 && y === 0) return;
      this.moveCursor({ x, y });
    },
    onSwitchDirection() {
      if (this.direction === 'horizontal') {
        this.direction = 'vertical';
      } else {
        this.direction = 'horizontal';
      }
      if (this.focusedCell) {
        this.focusedCell = { ...this.focusedCell };
      }
    },
    onWordHover(word) {
      this.selectedCells.forEach(({
        x,
        y,
      }, i) => {
        this.cells[this.getCoords(y, x)] = word.slice(i, i + 1);
      });
      this.refresh();
    },
    onSearch(value) {
      this.query = value;
      this.searchSuggestions();
    },
  },
  components: {
    textbox,
    Suggestions,
  },

};
</script>

<style scoped>
.container {
  display: flex;
  margin-left: 0;
  margin-right: 0;
  padding-left: 0;
}
.crosswords{
  overflow: scroll;
  min-height: calc(100vh - 767px);
  max-height: calc(100vh - 290px);
  min-width: calc(100vw - 442px);
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
