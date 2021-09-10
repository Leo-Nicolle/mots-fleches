<template>
  <div id="app">
    <Settings @change="onChange"/>
    <Crosswords :rows="rows" :cols="cols"/>

  </div>
</template>

<script>
import Crosswords from './components/Crosswords.vue';
import Settings from './components/Settings.vue';

export default {
  name: 'App',
  data() {
    return {
      rows: 10,
      cols: 10,
    };
  },
  components: {
    Crosswords,
    Settings,
  },
  methods: {
    onChange({ rows, cols }) {
      this.rows = rows;
      this.cols = cols;
    },
  },
};
</script>

<style>
</style>
