<template>
  <Layout :title="$t('passwordreset.title')" :alert="alert">
    <template #default>
      <n-form-item :label="$t('register.password')" path="password">
        <n-input role="password" type="password" placeholder="password" v-model:value="password"></n-input>
      </n-form-item>
      <n-form-item :label="$t('register.confirmPassword')" path="password">
        <n-input role="passwordcheck" type="password" placeholder="passwordcheck" v-model:value="passwordcheck"></n-input>
      </n-form-item>
    </template>
    <template #footer>
      <n-button class="cancel-btn" type="info" @click="cancel">{{
        $t("register.cancel")
      }}</n-button>
      <n-button class="register-btn" type="primary" @click="register">{{
        $t("passwordreset.submit")
      }}</n-button>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { api } from "../../api";
import { useAlert } from "../../js/useAlert";
import Layout from "../../layouts/NotLoggedin.vue";
import { useRoute, useRouter } from "vue-router";
const router = useRouter();
const route = useRoute();
const password = ref<string>("");
const passwordcheck = ref<string>("");
const { alert, setAlert } = useAlert();
const token = route.params.token as string;

async function register() {
  if (!token) {
    return setAlert("error", "resettokeninvalid");
  }
  if (password.value !== passwordcheck.value) {
    return setAlert("error", "passwordsdontmatch");
  }
  if (password.value.length < 6) {
    return setAlert("error", "passwordtooshort");
  }
  try {
    await api.remote.resetPassword(token, password.value);
    setAlert("success", "passwordresetsuccess");
    setTimeout(() => router.push("/login"), 2000);
  } catch (e) {
    const isNetworkError = !(e as any)?.response;
    setAlert("error", isNetworkError ? "serverUnreachable" : "resettokeninvalid");
  }
}
async function cancel() {
  router.push("/login");
}
</script>

<style>
.auth-footer {
  justify-content: space-between;
}
</style>

