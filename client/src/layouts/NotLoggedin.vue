<template>
  <Layout :is-logged-in="false">
    <template v-slot:body>
      <div class="notloggedin">
        <n-card :title="title" class="notloggedincard">
          <template #default>
            <slot />
          </template>
          <template #footer>
            <n-collapse-transition :show="alert">
              <span class="alert"> {{ alert }}</span>
            </n-collapse-transition>
            <div class="footer">
              <slot name="footer" />
            </div>
          </template>
          <template #action>
            <slot name="action" />
          </template>
        </n-card>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import Layout from "./Main.vue";

const props = defineProps<{
  alert: string | false;
  title: string;
}>();
</script>

<style>
.n-scrollbar-content:has(> .notloggedin) {
  height: 100%;
}
.notloggedin {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}
.notloggedincard {
  max-width: 450px;
}
.footer {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>

