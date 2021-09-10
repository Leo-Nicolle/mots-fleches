<template>
    <div class="suggestions">
        <b-field>
            <b-button class="is-primary" @click="$emit('switchdirection')">{{direction}}</b-button>
        </b-field>
        <b-field>
            <b-input placeholder="Recherche" type="search" icon="magnify" icon-clickable @icon-click="onSearch">
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
      columns: [{
        field: 'word',
        label: 'Suggestions',
        width: '40',
      }],
    };
  },
  props: ['suggestions', 'direction'],
  watch: {
    selected(newValue) {
      this.$emit('wordhover', newValue.word);
    },
  },
  methods: {
    onSearch() {
      console.log('onSearch');
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
