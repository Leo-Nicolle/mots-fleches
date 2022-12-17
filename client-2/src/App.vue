<template>
  <div id="Crosswords">
    <Editor
      v-if="grids[activeGrid]"
      :grid="grids[activeGrid]"
      @update="onUpdate"
    ></Editor>
  </div>
</template>

<script>
import axios from "axios";
import apiMixin from "./js/apiMixin";
// import Crosswords from "./components/Crosswords.vue";
import Editor from "./components/Editor.vue";
import { Grid } from "../../grid/src/Grid";

export default {
  name: "App",
  mixins: [apiMixin],
  data() {
    return {
      activeGrid: 0,
      grids: [],
    };
  },
  components: {
    // Crosswords,
    Editor,
  },
  methods: {
    fetch() {
      return axios
        .get(this.getUrl("grid"))
        .then(({ data }) => {
          this.grids = data.map((g) => Grid.unserialize(JSON.stringify(g)));
          if (this.grids.length === 0) {
            return this.createGrid().then(() => this.fetch());
            // .then(() => this.activeGrid= 0)
          }
        })
        .catch((e) => {
          console.error("E", e);
        });
    },
    createGrid() {
      const newGrid = new Grid(10, 10);
      newGrid.name = "nouvelle grille";
      return axios.post(this.getUrl("grid"), { grid: newGrid.serialize() });
    },
    onRefreshGrids() {
      this.fetch();
    },
    onDelete() {
      this.fetch().then(() => {
        this.activeGrid = (this.grids[0] && this.grids[0].id) || "";
      });
    },
    onUpdate() {
      axios.post(this.getUrl("grid"), {
        grid: this.grids[this.activeGrid].serialize(),
      });
    },
  },

  mounted() {
    this.fetch();
  },
};
</script>

<style>
</style>
