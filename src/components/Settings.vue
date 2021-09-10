<template>
<div class="settings">
  <button @click="$emit('switchdirection')">{{direction}}</button>
  <ul class="suggestions scrollbar">
    <li v-for="(suggestion,i) in suggestions" :key="i" @mouseover="$emit('wordhover', suggestion)">
      {{suggestion}}
    </li>
  </ul>
</div>
</template>

<script>
export default {
  name: 'Crosswords',
  props: ['suggestions', 'direction'],
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>
</style>
