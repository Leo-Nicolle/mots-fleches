<template>
  <div id="Grid">
    <Editor v-if="activeGrid" :grid="activeGrid" @update="onUpdate"></Editor>
    <div class="exp" :innerHtml="exp"></div>
  </div>
</template>

<script>
import axios from "axios";
import apiMixin from "../js/apiMixin";
import Editor from "../components/Editor.vue";
import { Grid } from "../grid";

export default {
  name: "Grid",
  mixins: [apiMixin],
  data() {
    return {
      activeGrid: 0,
      grids: [],
      saveTimeout: 0,
      exp: "",
    };
  },
  components: {
    Editor,
  },
  methods: {
    fetch() {
      return axios
        .get(this.getUrl(`grid/${this.$route.params.id}`))
        .then(({ data }) => {
          console.log("fetch");
          this.activeGrid = Grid.unserialize(JSON.stringify(data));
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
        // this.activeGrid = (this.grids[0] && this.grids[0].id) || "";
      });
    },
    onUpdate() {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        axios.post(this.getUrl("grid"), {
          grid: this.activeGrid.serialize(),
        });
      }, 500);
    },
  },

  mounted() {
    this.fetch();
  },
};
</script>

<style>
#Grid {
  max-height: 100vh;
  overflow: hidden;
}
body {
  width: min-content;
  max-width: 100vw;
  overflow: hidden;
}
.exp {
  position: absolute;
  top: 22px;
  left: 400px;
}
</style>
