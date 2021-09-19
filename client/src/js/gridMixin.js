import axios from 'axios';

export default {
  props: ['id'],
  data() {
    return {
      rows: 10,
      cols: 10,
      name: '',
      comment: '',
      cellValues: [],
      cells: {},
    };
  },
  mounted() {
    if (this.id && this.id.length) {
      this.fetch();
    } else {
      this.new();
    }
    setTimeout(() => {
      // this.upload();
    }, 2000);
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

    setupCells() {
      this.cells = new Array(this.rows).fill(0).map(() => new Array(this.cols).fill(''))
        .reduce((acc, row, i) => {
          row.forEach((_, j) => {
            const coords = this.getCoords(i, j);
            acc[coords] = this.cells[coords] || '';
          });
          return acc;
        }, {});
    },
    getCellValues() {
      const res = new Array(this.rows).fill(0).map(() => new Array(this.cols).fill(''));
      Object.entries(this.cells)
        .forEach(([coord, value], i) => {
          if (i < 3) {
            console.log('value', i, value);
          }
          const [row, col] = coord.split(',');
          res[row][col] = value;
        });
      return res;
    },
    refresh() {
      this.cellValues = this.getCellValues();
    },
    new() {
      this.rows = 10;
      this.cols = 10;
      this.name = 'nouvelle grille';
      this.setupCells();
      this.refresh();
      // this.upload();
    },
    fetch() {
      return axios.get(this.getUrl(`grid/${this.id}`))
        .then((response) => {
          this.unserializeGrid(response);
        })
        .catch((e) => {
          console.error(e);
          this.new();
        });
    },
    upload() {
      return axios.post(this.getUrl('grid'), this.serializeGrid())
        .catch((e) => {
          // console.log(e.response.data.errors);
        });
    },
    delete() {
      return axios.delete(this.getUrl(`grid/${this.id}`))
        .catch((e) => {
          // console.log(e.response.data.errors);
        });
    },
    serializeGrid() {
      return {
        rows: this.rows,
        cols: this.cols,
        name: this.name,
        cells: this.cells,
        comment: this.comment,
        id: this.id,
      };
    },
    unserializeGrid(response) {
      const { data } = response;
      this.rows = data.rows;
      this.cols = data.cols;
      this.name = data.name;
      if (Object.keys(data.cells).length) {
        this.cells = data.cells;
      } else {
        this.setupCells();
      }
      this.comment = data.comment;
      this.refresh();
    },
  },
};
