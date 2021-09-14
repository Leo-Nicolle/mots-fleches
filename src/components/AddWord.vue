<template>
    <section class="section">
        <b-field label="Nouveau mot" horizontal>
            <b-input v-model="word"></b-input>
            <b-button @click="onClick()">+</b-button>
        </b-field>

         <b-field label="Supprimer un  mot" horizontal>
            <b-input v-model="word"></b-input>
            <b-button @click="onClick()">+</b-button>
        </b-field>
    </section>
</template>

<script>
export default {
  name: 'AddWord',
  data() {
    return {
      word: '',
    };
  },
  methods: {
    onClick() {},
  },
};
</script>

<style>

.input {
  text-transform: uppercase;
}
</style>
