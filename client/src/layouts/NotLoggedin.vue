<template>
  <Layout :show-login-button="false" :left-panel-width="0">
    <template v-slot:body>
      <div class="notloggedin">
        <n-card :title="title" class="notloggedincard">
          <template #default>
            <slot />
          </template>
          <template #footer>
            <n-collapse-transition :show="alert">
              <span class="alert"> {{ $t(`alert.${alert && alert.id}`) }}</span>
            </n-collapse-transition>
            <div class="auth-footer">
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
import { onUnmounted } from "vue";
import Layout from "./Main.vue";
import { useResponsive } from "../js/useResponsive";
const props = defineProps<{
  alert: { type: string; id: string } | false;
  title: string;
}>();
</script>

<style>
.notloggedincard {
  width: 100%;
  max-width: 450px;
  margin: 0;
}

@media screen and (max-width: 768px) {
  .notloggedincard {
    max-width: 350px;
  }
}

.n-scrollbar-content:has(> .notloggedin) {
  min-height: 100%;
}
.notloggedin {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 2rem 1rem;
}
.auth-footer {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>

