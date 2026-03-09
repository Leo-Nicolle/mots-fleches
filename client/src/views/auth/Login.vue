<template>
  <Layout :title="$t('login.title')" :alert="alert">
    <template #default>
      <n-form-item :label="$t('login.email')" path="login">
        <n-input role="login" type="text" placeholder="name@mail.com" v-model:value="email" />
      </n-form-item>
      <n-form-item :label="$t('login.password')" path="password">
        <n-input role="password" type="password" placeholder="password" v-model:value="password"></n-input>
      </n-form-item>
      <span class="forgot-password hidden" @click="onForgotPassword">
        {{ $t("login.forgotPassword") }}
      </span>
    </template>
    <template #footer>
      <n-button class="login-btn" type="primary" @click="emailLogin">{{
        $t("login.login")
        }}</n-button>
      <n-button class="login-btn" type="info" @click="createAccount">{{
        $t("login.register")
        }}</n-button>
      <n-button class="login-btn" type="primary" @click="localMode">{{
        $t("login.localMode")
        }}</n-button>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { api } from "../../api";
import Layout from "../../layouts/NotLoggedin.vue";
import { useRoute, useRouter } from "vue-router";
import { useAlert } from "../../js/useAlert";

const router = useRouter();
const email = ref<string>("");
const password = ref<string>("");
const { alert, setAlert } = useAlert();
const route = useRoute();

function redirect() {
  return router.push((route.query.redirect as string) || "/");
}

async function emailLogin() {
  try {
    const { accessToken, refreshToken } = await api.remote.signin(
      email.value,
      password.value
    );
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    api.mode = "remote";
    api.syncOnLogin().catch(() => {}); // silent background sync
    redirect();
  } catch (e) {
    alert.value = { type: "error", id: "wrongpassword" };
    setTimeout(() => {
      alert.value = false;
    }, 3000);
  }
}

async function onForgotPassword() {
  await api.supadb.supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: `${location.origin}/passwordreset/`,
    },
  });
  router.push(`/sentemail/${btoa(email.value)}`);
}

function createAccount() {
  router.push("/register");
}

async function localMode() {
  api.mode = "idb";
  redirect();
}
</script>

<style>
.forgot-password {
  color: #888;
  font-style: italic;
  cursor: pointer;
}

.forgot-password:hover {
  color: #000;
  text-decoration: underline;
}

.hidden {
  display: none;
}
</style>
