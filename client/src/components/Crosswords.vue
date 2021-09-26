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
      <Export
        v-if="!!rows"
        :cols="cols"
        :rows="rows"
        :name="name"
        :cellValues="cellValues"
        :grid="this.serializeGrid().cells"
        :isDefinition="isDefinition"
      />
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

      <div class="wrapper column is-full scrollbar">
        <ul class="grid" :style="getTemapleColumn()">
          <li
            v-for="(item, i) in flatCells"
            :class="getClass(item.key)"
            :key="i"
          >
            <textbox
              @click="onSelectCell(item.i, item.j)"
              @switch="onSwitch($event, item.i, item.j)"
              @type="onType($event, item.i, item.j)"
              :value="item.value"
              :isDefinition="isDefinition[item.i][item.j]"
              :isImpossible="isImpossible(item.i, item.j)"
              :highlighted="isHighlighted(item.i, item.j)"
            >
            </textbox>
          </li>
        </ul>
      </div>
    </div>
    <div class="section">
      <b-field label="Commentaire">
        <b-input maxlength="500" v-model="comment" type="textarea"></b-input>
      </b-field>
    </div>
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
  computed: {
    flatCells() {
      return this.cells
        ? Object.entries(this.cells).map(([key, value]) => {
          const { x, y } = this.coordToXY(key);
          return {
            i: y,
            j: x,
            value,
          };
        })
        : [];
    },
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
      if (this.isDefinition[this.focusedCell.y][this.focusedCell.x]) return;
      this.searchSuggestions();
    },
  },
  methods: {
    getTemapleColumn() {
      return {
        gridTemplateColumns: new Array(this.cols)
          .fill(0)
          .map(() => '50px')
          .join(' '),
      };
    },
    getClass() {
      return '';
    },
    isImpossible(i, j) {
      return !!this.impossibleLetters.find(
        (coord) => coord.y === i && coord.x === j,
      );
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
          return new Promise((resolve) => setTimeout(() => resolve(), 200)).then(() => axios.post(this.getUrl('search'), {
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
        .then(({
          words, cells, impossible, nbRestuls,
        }) => {
          if (!words) return;
          this.loadingSuggestions = false;
          this.resultLength = nbRestuls;
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
      // this.refresh();
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
      this.delete(this.getUrl(`grid/${this.id}`)).then(() => {
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

.grid li {
  list-style-type: none;
  text-align: center;
  text-transform: capitalize;
  font-size: 45px;
  min-height: 50px;
  max-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  word-break: break-all;
}
.grid {
  width: 100%;
  display: grid;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  font-family: "Montserrat", sans-serif;
}
.grid li.definition {
  font-size: 12px;
  text-transform: none;
}
.wrapper {
  max-width: 100vw;
  max-height: 685px;
  padding: 10px 16px;
}
</style>
