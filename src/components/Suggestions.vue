<template>
    <div class="suggestions">
        <b-field>
            <b-button class="is-primary" @click="$emit('switchdirection')">{{direction}}</b-button>
        </b-field>
        <b-field>
            <b-input
              placeholder="Recherche"
              type="search"
              icon="magnify"
              icon-clickable
              v-model="dataQuery"
              @icon-click="onSearch"
              @input="onSearch">
            </b-input>
        </b-field>
        <b-table :data="suggestions" :columns="columns" :paginated="true" :per-page="10" :pagination-simple="true" :selected.sync="selected" hoverable clickable />
    </div>
</template>

<script>
export default {
  name: 'Crosswords',
  data() {
    return {
      selected: null,
      dataQuery: '',
      columns: [{
        field: 'word',
        label: 'Suggestions',
        width: '40',
      }],
    };
  },
  props: ['suggestions', 'direction', 'query'],
  watch: {
    selected(newValue) {
      this.$emit('wordhover', newValue.word);
    },
    query(newValue) {
      this.dataQuery = newValue;
    },
  },
  methods: {
    onSearch(value) {
      this.$emit('search', value);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style>
.suggestions {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-left: 30px;

    max-width: 344px;
    min-width: 344px;

}

table td:hover {
    cursor: pointer;
}

table td:hover {
    font-size: 20px;
}
</style>
