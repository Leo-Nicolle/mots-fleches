<template>
  <div id="app">
    <Settings @change="onChange"/>
    <Crosswords :rows="rows" :cols="cols"/>
    <AddWord />

  </div>
</template>

<script>
import Crosswords from './components/Crosswords.vue';
import Settings from './components/Settings.vue';
import AddWord from './components/AddWord.vue';

export default {
  name: 'App',
  data() {
    return {
      rows: 13,
      cols: 10,
    };
  },
  components: {
    Crosswords,
    Settings,
    AddWord,
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

.scrollbar {
    float: left;
    background: #F5F5F5;
    overflow-y: scroll;
    margin-bottom: 25px;
    margin-left: 0;
}

.scrollbar::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: #F5F5F5;
}

.scrollbar::-webkit-scrollbar {
    width: 12px;
    background-color: #F5F5F5;
}

.scrollbar::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #555;
}

</style>
