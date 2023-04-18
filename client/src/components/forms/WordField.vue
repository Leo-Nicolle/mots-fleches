<template>
  <b-field
    :label="label"
    horizontal
    :message="errorMessage"
    :type="success ? 'is-success' : danger ? 'is-danger' : ''"
  >
    <b-autocomplete
      rounded
      v-model="word"
      :data="filteredWords"
      placeholder="un mot..."
      :icon="mode === 'add' ? 'plus' : 'delete'"
      clearable
      @keyup.enter="onClick"
      @select="(option) => (word = option)"
    >
      <template #empty>Pas de mot</template>
    </b-autocomplete>
    <b-button @click="onClick" :loading="loading">{{ icon }}</b-button>
  </b-field>
</template>
<script lang="ts">
import axios from "axios";
import apiMixin from "../js/apiMixin";
/**
 * TODO: turn to composition API
 */
export default {
  name: "WordField",
  props: ["label", "icon", "mode", "words"],
  mixins: [apiMixin],
  data() {
    return {
      word: "",
      errorMessage: null,
      loading: false,
      danger: false,
      success: false,
    };
  },
  computed: {
    filteredWords() {
      return this.words.filter((w) => w.startsWith(this.word));
    },
  },

  methods: {
    getRequest() {
      if (this.mode === "add") {
        return axios.post(this.getUrl("word"), {
          word: this.word,
        });
      }
      return axios.delete(this.getUrl(`word/${this.word}`));
    },
    onClick() {
      this.loading = true;
      this.getRequest()
        .then(() => {
          this.success = true;
          setTimeout(() => {
            this.success = false;
            this.$emit("refresh");
          }, 1000);
        })
        .catch((e) => {
          this.danger = true;
          this.errorMessage = e.response.data.errors
            .map((e) => e.msg)
            .join(" ");
          setTimeout(() => {
            this.danger = false;
            this.errorMessage = null;
          }, 1000);
        })
        .finally(() => {
          this.loading = false;
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
