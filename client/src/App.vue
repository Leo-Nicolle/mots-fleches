<template>
  <div id="app">
    <b-tabs
      v-if="grids.length"
      type="is-boxed"
      v-model="activeGrid"
      @input="onTabChanged"
      :multiline="true"
    >
      <template v-for="grid in grids">
        <b-tab-item
          :key="grid.id"
          :value="grid.id"
          :label="grid.name"
          is-active="true"
          is-selected="true"
        >
        </b-tab-item>
      </template>
    </b-tabs>
    <Crosswords v-if="activeGrid.length" :id="activeGrid" @refresh-grids="onRefreshGrids" @delete="onDelete"/>
    <AddWord />
  </div>
</template>

<script>
import axios from 'axios';
import Crosswords from './components/Crosswords.vue';
import AddWord from './components/AddWord.vue';
import apiMixin from './js/apiMixin';

export default {
  name: 'App',
  mixins: [apiMixin],
  data() {
    return {
      rows: 13,
      cols: 10,
      activeGrid: '',
      grids: [],
    };
  },
  components: {
    Crosswords,
    AddWord,
  },
  methods: {
    fetch() {
      return axios.get(this.getUrl('grid')).then(({ data }) => {
        this.grids = data
          .map((g) => ({
            name: g.name,
            id: g.id,
          }))
          .concat({
            name: '+',
            id: '',
          });
        return Promise.resolve();
      }).catch((e) => {
        console.error('E', e);
      });
    },
    createGrid() {
      return axios.post(this.getUrl('grid'), {
        name: 'nouvelle grille',
        comment: '',
        rows: 10,
        cols: 10,
        cells: {},
      });
    },
    onTabChanged(activeTab) {
      if (!activeTab.length) {
        let newGridId;
        this.createGrid()
          .then(({ data }) => {
            newGridId = data;
          })
          .then(() => this.fetch())
          .then(() => {
            this.activeGrid = newGridId;
          });
      }
    },
    onRefreshGrids() {
      this.fetch();
    },
    onDelete() {
      this.fetch().then(() => {
        this.activeGrid = this.grids[0] && this.grids[0].id || '';
      });
    },
  },

  mounted() {
    this.fetch().then(() => {
      if (this.grids.length < 2) {
        return this.createGrid()
          .then(() => this.fetch());
      }
      return Promise.resolve();
    }).then(() => {
      this.activeGrid = this.grids[0] && this.grids[0].id || '';
    });
  },
};
</script>

<style>
.scrollbar {
  float: left;
  background: #f5f5f5;
  overflow-y: scroll;
  margin-bottom: 25px;
  margin-left: 0;
}

.scrollbar::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: #f5f5f5;
}

.scrollbar::-webkit-scrollbar {
  width: 12px;
  background-color: #f5f5f5;
}

.scrollbar::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #555;
}
</style>
