import axios from 'axios';
import mazeGenerator from './maze-generator';
import generator from './new-generator'

window.generator = generator;
export default {
  props: ['id'],
  data() {
    return {
      rows: 10,
      cols: 10,
      name: '',
      comment: '',
      uploadInterval: null,
      cellValues: [],
      distribution: [],
      isDefinition: [],
      cells: {},
    };
  },
  mounted() {
    if (this.id && this.id.length) {
      this.fetch();
    } else {
      this.new();
    }
    this.uploadInterval = setInterval(() => {
      if (this.id && this.id.length) this.upload();
    }, 5000);
  },
  beforeDestroy() {
    clearInterval(this.uploadInterval);
  },
  watch: {
    id: {
      immediate: true,
      handler() { this.fetch(); },
    },
  },
  methods: {
    getCoords(row, col) {
      return `${row},${col}`;
    },
    coordToXY(coords) {
      const [y, x] = coords.match(/(\d+),(\d+)/).slice(1).map((n) => +n);
      return { x, y };
    },
    xyToIndex({ x, y }) {
      return y * this.cols + x;
    },

    setupCells(isDefinition) {
      this.cells = new Array(this.rows).fill(0).map(() => new Array(this.cols).fill(''))
        .reduce((acc, row, i) => {
          row.forEach((_, j) => {
            const coords = this.getCoords(i, j);
            acc[coords] = this.cells[coords]
              ? ''
              : isDefinition && isDefinition[i][j]
                ? '\n'
                : '';
          });
          return acc;
        }, {});
      this.isDefinition = isDefinition || new Array(this.rows).fill(0).map(() => new Array(this.cols).fill(false))
        .map((e, i) => e.map((_, j) => this.isDefinition[i] && this.isDefinition[i][j]));
    },
    getCellValues() {
      const res = new Array(this.rows).fill(0).map(() => new Array(this.cols).fill(''));
      Object.entries(this.cells)
        .forEach(([coord, value], i) => {
          // if (i < 3) {
          //   console.log('value', i, value);
          // }
          const [row, col] = coord.split(',');
          res[row][col] = value;
        });
      return res;
    },
    refresh() {
      this.cellValues = this.getCellValues();
    },
    new() {
      return axios.get(this.getUrl(`dico-length`))
      .then(({data}) => {
        this.distribution = data; 
      })
      .then(() => {
        this.rows = 10;
        this.cols = 10;
        this.name = 'nouvelle grille';
        const isDefinition = mazeGenerator({ 
          rows: this.rows,
          cols: this.cols,
          distribution: this.distribution 
        });
        this.setupCells(isDefinition);
        this.refresh();
        generator.run(isDefinition, this.cellValues);
    });

      // this.upload();
    },
    fetch() {
      return Promise.all([
        axios.get(this.getUrl(`grid/${this.id}`)),
        axios.get(this.getUrl(`dico`))
      ])
        .then(([grid, dico]) => {
          dico.data.forEach(word => generator.addToDico(word));
          this.unserializeGrid(grid);
        })
        .catch((e) => {
          console.error(e);
          this.new();
        })
    },
    upload() {
      return axios.post(this.getUrl('grid'), this.serializeGrid());
    },
    delete() {
      return axios.delete(this.getUrl(`grid/${this.id}`))
        .catch((e) => {
          // console.log(e.response.data.errors);
        });
    },
    serializeGrid() {
      if (!this.$el || !this.$el.querySelectorAll) return {};
      const inputs = [...this.$el.querySelectorAll('.definition,.letter')];
      if (!inputs.length) return {};
      const cells = Object.keys(this.cells)
        .reduce((cells, coord) => {
          const { x, y } = this.coordToXY(coord);
          const index = this.xyToIndex({ x, y });
          cells[coord] = {
            isDefinition: this.isDefinition[y] && this.isDefinition[y][x]
              ? this.isDefinition[y][x] : false,
            value: inputs[index] ? inputs[index].value : '',
          };
          return cells;
        }, {});
      return {
        rows: this.rows,
        cols: this.cols,
        name: this.name,
        cells,
        comment: this.comment,
        id: this.id,
      };
    },
    unserializeGrid(response) {
      const { data } = response;
      this.rows = data.rows;
      this.cols = data.cols;

      this.name = data.name;
      const isDefinition = new Array(this.rows)
        .fill(0).map(() => new Array(this.cols).fill(false));

      if (!data.name.includes('nouvelle') && Object.keys(data.cells).length) {
        this.isDefinition = isDefinition;
        this.cells = Object.entries(data.cells)
          .reduce((cells, [coord, value]) => {
            const isDef = value.isDefinition;
            if (isDef) {
              const { x, y } = this.coordToXY(coord);
              isDefinition[y][x] = true;
            }
            cells[coord] = value.value;
            return cells;
          }, {});
      } else {
        this.new();
      }
      this.comment = data.comment;
      this.refresh();
    },
  },
};
