<template>
  <Layout :title="$t('sentemail.title')">
    <template #default>
      <p>
        {{ $t("sentemail.message", { email }) }}
      </p>
    </template>
    <template #footer>
      <n-button class="redirect-btn" type="primary" @click="redirect">{{
        $t("sentemail.redirect")
      }}</n-button>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "../../layouts/NotLoggedin.vue";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
const router = useRouter();
const route = useRoute();

const email = ref<string>(
  atob(route.query ? (route.params.hash as string) : "")
);

function redirect() {
  router.push("/");
}
</script>

<style></style>

