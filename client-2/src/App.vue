<template>
  <div id="Crosswords">
     <Editor></Editor>
  </div>
</template>

<script>
import axios from "axios";
import apiMixin from "./js/apiMixin";
import Crosswords from "./components/Crosswords.vue";
import Editor from "./components/Editor.vue";
import Grid from './js/Grid';

const g = new Grid(10,10);
export default {
  name: "Crosswords",
  mixins: [apiMixin],
  data() {
     return {
      grid: g,
      rows: 13,
      cols: 10,
      activeGrid: "",
      grids: [],
    };
  },
  components: {
    Crosswords,
    Editor,
  },
  methods: {
       fetch() {
      return axios
        .get(this.getUrl("grid"))
        .then(({ data }) => {
          this.grids = data
            .map((g) => ({
              name: g.name,
              id: g.id,
            }))
            .concat({
              name: "+",
              id: "",
            });
          return Promise.resolve();
        })
        .catch((e) => {
          console.error("E", e);
        });
    },
    createGrid() {
      return axios.post(this.getUrl("grid"), {
        name: "nouvelle grille",
        comment: "",
        rows: 10,
        cols: 10,
        cells: {},
      });
    },
    onRefreshGrids() {
      this.fetch();
    },
    onDelete() {
      this.fetch().then(() => {
        this.activeGrid = (this.grids[0] && this.grids[0].id) || "";
      });
    },
  },

  mounted() {
  },
};
</script>

<style>
</style>
