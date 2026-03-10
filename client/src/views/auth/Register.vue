<template>
  <Layout :title="$t('register.title')" :alert="alert">
    <template #default>
      <n-form-item :label="$t('register.pseudo')" path="pseudo">
        <n-input type="text" :placeholder="$t('register.pseudoPlaceholder')" v-model:value="pseudo" />
      </n-form-item>
      <n-form-item :label="$t('register.email')" path="login">
        <n-input role="login" type="text" placeholder="name@mail.com" v-model:value="email" />
      </n-form-item>
      <n-form-item :label="$t('register.password')" path="password">
        <n-input role="password" type="password" placeholder="password" v-model:value="password"></n-input>
      </n-form-item>
      <n-form-item :label="$t('register.confirmPassword')" path="password">
        <n-input role="passwordcheck" type="password" placeholder="passwordcheck"
          v-model:value="passwordcheck"></n-input>
      </n-form-item>
    </template>
    <template #footer>
      <n-button class="cancel-btn" type="info" @click="cancel">{{
        $t("register.cancel")
        }}</n-button>
      <n-button class="register-btn" type="primary" @click="register">{{
        $t("register.send")
        }}</n-button>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { api } from "../../api";
import Layout from "../../layouts/NotLoggedin.vue";
import { useRouter } from "vue-router";
import { useAlert } from "../../js/useAlert";
const router = useRouter();
const pseudo = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");
const passwordcheck = ref<string>("");

const { alert, setAlert } = useAlert();
async function register() {
  if (password.value !== passwordcheck.value) {
    setAlert("error", "passwordmismatch");
    return;
  }
  try {
    await api.remote.register(email.value, password.value, pseudo.value || undefined);
    router.push("/login");
  } catch (error) {
    setAlert("error", "registerfailed");
  }
}
async function cancel() {
  router.push("/login");
}
</script>

<style>
.footer {
  justify-content: space-between;
}
</style>
