<template>
<div class="settings">
  <b-field>
    <b-numberinput v-model="cols" @input="$emit('change', {rows,cols})"></b-numberinput>
  </b-field>

  <b-field>
    <b-numberinput v-model="rows" @input="$emit('change', {rows,cols})"></b-numberinput>
  </b-field>

</div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      rows: 10,
      cols: 10,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>
</style>
