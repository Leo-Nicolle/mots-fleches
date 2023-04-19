<template>
  <div class="lougout">
    <n-icon v-if="!closed" size="5em" >
      <LoaderIcon />
    </n-icon>
    <span>
      {{ $t(`logout.${message}`) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import LoaderIcon from "../components/LoaderIcon.vue";
import { getUrl } from "../js/utils";
/**
 * View to logout and close the server
 */
const closed = ref(false);
const message = ref<string>("waiting");
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
        message.value = "waiting";
      })
      .catch(() => {
        closed.value = true;
        message.value = "success";
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
</style>

