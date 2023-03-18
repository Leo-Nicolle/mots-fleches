<template>
<section class="section">
   <WordField mode="add" label="Nouveau mot" icon="+" :words="words" @refresh="onRefresh"/>
   <WordField mode="delete" label="Supprimer un mot" icon="x" :words="words" @refresh="onRefresh"/>
</section>
</template>

<script>
import axios from 'axios';
import WordField from './WordField.vue';
import apiMixin from '../js/apiMixin';

export default {
  name: 'AddWord',
  components: {
    WordField,
  },
  data() {
    return {
      words: [],
    };
  },
  mixins: [apiMixin],
  mounted() {
    this.getWords();
  },
  methods: {
    onRefresh() {
      this.getWords();
    },
    getWords() {
      axios.get(this.getUrl('word'))
        .then(({ data }) => {
          this.words = data;
        });
    },
  },
};
</script>

<style>
.input {
    text-transform: uppercase;
}
</style>
