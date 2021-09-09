<template>
<div class="suggestions">
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
.suggestions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-left: 30px;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow-y: scroll;
  max-height: 85vh;
  min-width: 145px;
  margin-left: 0;
}
button{
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
