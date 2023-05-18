<template>
  <RefreshCircleOutline class="loader" />
</template>

<script setup lang="ts">
import { RefreshCircleOutline } from "@vicons/ionicons5";
</script>

<style scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
.loader {
  animation: 1s linear 1s infinite running rotate;
}
</style>

