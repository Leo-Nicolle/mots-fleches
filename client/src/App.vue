<template>
  <div>
    <n-alert
      v-if="alert"
      class="alert-toaster"
      :title="$t(`alert.${alert.id}.title`)"
      :type="alert.type"
      bordered
      closable
    >
      {{ $t(`alert.${alert.id}.content`) }}
    </n-alert>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import './api';
/**
 * Main Component: handles the alert toaster for server disconnection
 */
const alert = ref<false | { type: string; id: string }>(false);

onMounted(async () => {
});
</script>
<style>
.alert-toaster {
  width: 100vw;
}
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
</style>
