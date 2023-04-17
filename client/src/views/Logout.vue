<template>
  <div class="lougout">
    <n-icon v-if="!closed" size="5em" class="loader">
      <RefreshCircleOutline />
    </n-icon>
    <span>
      {{ message }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { RefreshCircleOutline } from "@vicons/ionicons5";
import { getUrl } from "../js/utils";
/**
 * View to logout and close the server
 */
const closed = ref(false);
const waiting = "Fermeture du serveur...";
const message = ref<string>(waiting);
function ping(): Promise<any> {
  return axios.get(getUrl("ping"));
}
function exit() {
  return axios.get(getUrl("kill"));
}

onMounted(() => {
  setTimeout(() => {
    exit();
  }, 500);
  const interval = setInterval(() => {
    ping()
      .then(() => {
        message.value = waiting;
      })
      .catch(() => {
        closed.value = true;
        message.value = "Serveur fermé.";
        clearInterval(interval);
      });
  }, 1000);
});
</script>

<style scoped>
.lougout {
  width: calc(100vw - 20px);
  height: calc(100vh - 20px);
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2em;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
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

