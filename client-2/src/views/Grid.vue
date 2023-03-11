<template>
  <div id="Grid">
    <Editor v-if="grid" :grid="grid" @update="onUpdate"></Editor>
  </div>
</template>

<script>
import axios from "axios";
import apiMixin from "../js/apiMixin";
import Editor from "../components/Editor.vue";
import { Grid } from "grid";
import { save } from "../js/utils";

export default {
  name: "Grid",
  mixins: [apiMixin],
  data() {
    return {
      grid: 0,
      saveTimeout: 0,
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
          this.grid = Grid.unserialize(JSON.stringify(data));
        })
        .catch((e) => {
          console.error("E", e);
        });
    },
    onUpdate() {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        save(this.grid);
      }, 50);
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
</style>
