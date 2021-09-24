<template>
  <div>
    <div class="section head">
      <span></span>
    </div>
    <div class="level">
      <Settings
        class="level-item has-text-centered"
        @change="onSettingsChange"
        @close="onSettingsClose"
        @delete="onDeleteGrid"
        :rowP="rows"
        :colP="cols"
        :nameP="name"
      />
      <p class="title level-item has-text-centered">{{ name }}</p>
      <p class="level-item has-text-centered"></p>
      <b-button class="level-item has-text-centered" @click="upload"
        >sauvegarder</b-button
      >
    </div>
    <div class="container section columns" @keyup="onKeyUp">
      <Suggestions
        :suggestions="suggestions"
        :direction="direction"
        :loading="loadingSuggestions"
        :resultLength="resultLength"
        @switchdirection="onSwitchDirection"
        @wordhover="onWordHover"
        class="column"
      />
      <div class="crosswords column scrollbar">
        <div v-for="(row, i) in cellValues" class="columns" :key="i">
          <div v-for="(col, j) in row" :key="j" class="column is-narrow cell">
            <textbox
              @click="onSelectCell(i, j)"
              @switch="onSwitch($event, i, j)"
              @type="onType($event, i, j)"
              :value="col"
              :isDefinition="isDefinition[i][j]"
              :isImpossible = "isImpossible(i,j)"
              :highlighted="isHighlighted(i, j)"
            >
            </textbox>
          </div>
        </div>
      </div>
    </div>
    <div class = "section">
       <b-field label="Commentaire">
            <b-input maxlength="500" v-model="comment" type="textarea"></b-input>
        </b-field>
    </div>
    <Export v-if="!!rows" :cols="cols" :rows="rows" :cellValues="cellValues" :grid="this.serializeGrid().cells" :isDefinition="isDefinition" />
  </div>
</template>

<script>
import axios from 'axios';
import apiMixin from '../js/apiMixin';
import gridMixin from '../js/gridMixin';
import Settings from './Settings.vue';
import Suggestions from './Suggestions.vue';
import textbox from './textbox.vue';
import Export from './Export.vue';

export default {
  name: 'Crosswords',
  mixins: [gridMixin, apiMixin],
  data() {
    return {
      resultLength: 0,
      direction: 'horizontal',
      suggestions: [],
      impossibleLetters: [],
      focusedCell: null,
      method: 'fastest',
      selectedCells: [],
      loadingSuggestions: false,
      findWordPromise: Promise.resolve(),
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
  computed: {},
  methods: {
    isImpossible(i, j) {
      return !!this.impossibleLetters.find((coord) => coord.y === i && coord.x === j);
    },
    isHighlighted(row, col) {
      if (!this.selectedCells.length) return false;
      return !!this.selectedCells.find(
        (cell) => cell.x === col && cell.y === row,
      );
    },
    moveCursor(direction) {
      const children = [...this.$el.querySelectorAll('.definition,.letter')];
      const focused = document.activeElement;
      const evtIndex = children.findIndex((c) => c === focused);
      if (evtIndex < 0) return;
      const col = evtIndex % this.cols;
      const row = Math.floor(evtIndex / this.cols);
      const newCol = Math.max(Math.min(col + direction.y, this.cols - 1), 0);
      const newRow = Math.max(Math.min(row + direction.x, this.rows - 1), 0);
      children[newCol + newRow * this.cols].focus();
      this.refresh();
      this.focusedCell = {
        x: newCol,
        y: newRow,
      };
    },
    searchSuggestions() {
      if (!this.focusedCell) return Promise.resolve();
      this.findWordPromise = this.findWordPromise
        .then(() => {
          this.loadingSuggestions = true;
          return new Promise((resolve) => setTimeout(() => resolve(), 200))
            .then(() => axios.post(this.getUrl('search'), {
              grid: this.cellValues,
              isDefinition: this.isDefinition,
              coord: {
                x: this.focusedCell.x,
                y: this.focusedCell.y,
              },
              dir: this.direction,
              query: '',
              max: 100,
            }));
        })
        .then((response) => response.data)
        .then(({ words, cells, impossible }) => {
          if (!words) return;
          this.loadingSuggestions = false;
          this.resultLength = words.length;
          this.suggestions = words.slice(0, 100).map((word) => ({ word }));
          this.impossibleLetters = impossible;
          this.selectedCells = cells;
        })
        .catch((e) => {
          console.error(e);
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
      const newChar = isDefinition ? String.fromCharCode(10) : '';
      this.isDefinition[row][col] = isDefinition;
      const coords = this.getCoords(row, col);
      this.cells[coords] = newChar;
      this.selectedCells = [];
      this.refresh();
    },
    onType(evt, row, col) {
      const coords = this.getCoords(row, col);
      if (this.isDefinition[row][col]) return;
      this.cells[coords] = evt;
    },
    onKeyUp(evt) {
      if (!this.focusedCell) {
        this.focusedCell = { x: 0, y: 0 };
      }
      const isDef = this.isDefinition[this.focusedCell.y][this.focusedCell.x];
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
      } else if (!isDef && evt.code === 'Backspace') {
        if (this.direction === 'horizontal') {
          y = -1;
        } else {
          x = -1;
        }
      } else if (!isDef && evt.key.match(/\w/)) {
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
      this.selectedCells.forEach(({ x, y }, i) => {
        this.cells[this.getCoords(y, x)] = word.slice(i, i + 1);
      });
      this.refresh();
    },
    onSettingsChange({ rows, cols, name }) {
      this.rows = rows;
      this.cols = cols;
      this.name = name;
    },
    onSettingsClose() {
      this.upload().then(() => this.$emit('refresh-grids'));
    },
    onDeleteGrid() {
      this.delete(this.getUrl(`grid/${this.id}`))
        .then(() => {
          this.$emit('delete');
        });
    },
  },
  components: {
    textbox,
    Suggestions,
    Settings,
    Export,
  },
};
</script>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
}
.container {
  display: flex;
  margin-left: 0;
  margin-right: 0;
  padding-left: 0;
}
.crosswords {
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
.cell {
  padding: 4px;
}
</style>
