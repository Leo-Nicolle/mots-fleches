<template>
  <div id="outside"></div>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import './api';

onMounted(async () => {
});
</script>
<style>
.scroll::-webkit-scrollbar {
  width: 5px;
}

.scroll::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 20px;
}

.scroll::-webkit-scrollbar-track {
  background: #ddd;
  border-radius: 20px;
}

/** loader rotation animation */
@keyframes loader {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.rotating {
  animation: rotating 2s linear infinite;
}

.hidden-input {
  position: absolute;
  bottom: 0px;
  left: 0px;
  pointer-events: none;
  visibility: hidden;
  display: block;
}

.title {
  display: flex;
  justify-content: space-between;
}

.title .n-button {
  margin-right: 4px;
}

h2 {
  margin-top: 0;
}

body {
  overflow: hidden;
}
</style>
