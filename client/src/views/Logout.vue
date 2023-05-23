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
import { api } from "../api";
import { useRouter } from "vue-router";
/**
 * View to logout and close the server
 */
const router = useRouter();
const closed = ref(false);
const message = ref<string>("waiting");
function exit() {
  if (api.mode === 'supadb'){
    return api.supadb.supabase.auth.signOut();
  } 
  return Promise.resolve(); 
  
}

onMounted(() => {
  setTimeout(() => {
    exit()
    .then(() => {
      message.value = "success";
      closed.value = true;
      router.push('/login');
    });
  }, 500);

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

