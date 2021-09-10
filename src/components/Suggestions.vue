<template>
    <div class="suggestions column">
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
}

table td:hover {
    cursor: pointer;
}

table td:hover {
    font-size: 20px;
}

ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow-y: scroll;
    max-height: 56vh;
    min-width: 145px;
    margin-left: 0;
}

button {
    margin-bottom: 2px;
}

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

li {
    font: 200 20px/1.5 Helvetica, Verdana, sans-serif;
    border-bottom: 1px solid #ccc;
    cursor: pointer;
    padding: 8px 0;
}

li:last-child {
    border: none;
    padding: 2px;
}

li:hover {
    font-size: 22px;
    background: #f6f6f6;
}
</style>
