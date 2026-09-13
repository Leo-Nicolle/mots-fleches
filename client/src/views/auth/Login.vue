<template>
  <Layout :title="$t('login.title')" :alert="alert">
    <template #default>
      <n-form-item :label="$t('login.email')" path="login">
        <n-input role="login" type="text" placeholder="name@mail.com" v-model:value="email" />
      </n-form-item>
      <n-form-item v-if="!showForgotPassword" :label="$t('login.password')" path="password">
        <n-input role="password" type="password" placeholder="password" v-model:value="password"></n-input>
      </n-form-item>
      <span v-if="!showForgotPassword" class="forgot-password" @click="onForgotPassword">
        {{ $t("login.forgotPassword") }}
      </span>
      <div v-if="showForgotPassword" ref="turnstileRef"></div>
    </template>
    <template #footer>
      <template v-if="!showForgotPassword">
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
      <template v-else>
        <n-button class="login-btn" type="info" @click="showForgotPassword = false">{{
          $t("register.cancel")
          }}</n-button>
        <n-button class="login-btn" type="primary" :disabled="!canSendResetLink" @click="sendResetLink">{{
          $t("login.sendResetLink")
          }}</n-button>
      </template>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { api } from "../../api";
import Layout from "../../layouts/NotLoggedin.vue";
import { useRoute, useRouter } from "vue-router";
import { useAlert } from "../../js/useAlert";
import { postEvent } from "../../js/telemetry";

const router = useRouter();
const email = ref<string>("");
const password = ref<string>("");
const { alert, setAlert } = useAlert();
const route = useRoute();

const showForgotPassword = ref(false);
const turnstileRef = ref<HTMLDivElement | null>(null);
const turnstileToken = ref<string | null>(null);
const canSendResetLink = computed(() => !!email.value && !!turnstileToken.value);

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
    postEvent("login");
    redirect();
  } catch (e) {
    const isNetworkError = !(e as any)?.response;
    alert.value = { type: "error", id: isNetworkError ? "serverUnreachable" : "wrongpassword" };
    setTimeout(() => {
      alert.value = false;
    }, 3000);
  }
}

function renderTurnstileWidget() {
  if (!turnstileRef.value || !(window as any).turnstile) return;
  (window as any).turnstile.render(turnstileRef.value, {
    sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
    callback: (token: string) => { turnstileToken.value = token; },
    "expired-callback": () => { turnstileToken.value = null; },
  });
}

function loadTurnstile() {
  if ((window as any).turnstile) {
    renderTurnstileWidget();
    return;
  }
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.onload = renderTurnstileWidget;
  document.head.appendChild(script);
}

async function onForgotPassword() {
  showForgotPassword.value = true;
  await nextTick();
  loadTurnstile();
}

async function sendResetLink() {
  if (!email.value) {
    setAlert("error", "wrongpassword");
    return;
  }
  try {
    await api.remote.requestPasswordReset(email.value, turnstileToken.value || undefined);
    router.push(`/sentemail/${btoa(email.value)}`);
  } catch (e) {
    console.error(e);
    const isNetworkError = !(e as any)?.response;
    setAlert("error", isNetworkError ? "serverUnreachable" : "registerfailed");
    (window as any).turnstile?.reset();
    turnstileToken.value = null;
  }
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
</style>
