<template>
  <div id="Crosswords">
     <EditGrid></EditGrid>
  </div>
</template>

<script>
import axios from "axios";
import apiMixin from "./js/apiMixin";
import Crosswords from "./components/Crosswords.vue";
import EditGrid from "./components/EditGrid.vue";

{/* <Crosswords
      :id="activeGrid"
      @refresh-grids="onRefreshGrids"
      @delete="onDelete"
    /> */}
export default {
  name: "Crosswords",
  mixins: [apiMixin],
  data() {
     return {
      rows: 13,
      cols: 10,
      activeGrid: "",
      grids: [],
    };
  },
  components: {
    Crosswords,
    EditGrid,

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
