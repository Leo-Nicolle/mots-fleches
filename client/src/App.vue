<template>
  <div id="app">
    <Crosswords :id="gridId" />
    <AddWord />
  </div>
</template>

<script>
import Crosswords from './components/Crosswords.vue';
import AddWord from './components/AddWord.vue';

export default {
  name: 'App',
  data() {
    return {
      rows: 13,
      cols: 10,
      gridId: 'c8d01be9-88d8-45ea-a0fa-30b85db6af68',
    };
  },
  components: {
    Crosswords,
    AddWord,
  },
  methods: {

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
