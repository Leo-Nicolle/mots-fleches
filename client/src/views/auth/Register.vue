<template>
  <Layout :title="$t('register.title')" :alert="alert">
    <template #default>
      <n-form-item :label="$t('register.pseudo')" path="pseudo">
        <n-input type="text" autocomplete="nickname" :placeholder="$t('register.pseudoPlaceholder')" v-model:value="pseudo" />
      </n-form-item>
      <n-form-item :label="$t('register.email')" path="login">
        <n-input type="email" autocomplete="email" placeholder="name@mail.com" v-model:value="email" />
      </n-form-item>
      <n-form-item :label="$t('register.password')" path="password">
        <n-input type="password" autocomplete="new-password" placeholder="password" v-model:value="password"></n-input>
      </n-form-item>
      <n-form-item :label="$t('register.confirmPassword')" path="password">
        <n-input type="password" autocomplete="new-password" placeholder="passwordcheck"
          v-model:value="passwordcheck"></n-input>
      </n-form-item>
      <div ref="turnstileRef"></div>
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
import { ref, onMounted } from "vue";
import { api } from "../../api";
import Layout from "../../layouts/NotLoggedin.vue";
import { useRouter } from "vue-router";
import { useAlert } from "../../js/useAlert";
const router = useRouter();
const pseudo = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");
const passwordcheck = ref<string>("");
const turnstileRef = ref<HTMLDivElement | null>(null);
const turnstileToken = ref<string | null>(null);

const { alert, setAlert } = useAlert();
console.log("Turnstile site key:", import.meta.env.VITE_TURNSTILE_SITE_KEY);
function renderWidget() {
  if (!turnstileRef.value) return;
  (window as any).turnstile.render(turnstileRef.value, {
    sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
    callback: (token: string) => { turnstileToken.value = token; },
    "expired-callback": () => { turnstileToken.value = null; },
  });
}

onMounted(() => {
  if ((window as any).turnstile) {
    renderWidget();
    return;
  }
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.onload = renderWidget;
  document.head.appendChild(script);
});

async function register() {
  if (password.value !== passwordcheck.value) {
    setAlert("error", "passwordmismatch");
    return;
  }
  if (!turnstileToken.value) {
    setAlert("error", "captcharequired");
    return;
  }
  try {
    await api.remote.register(email.value, password.value, pseudo.value || undefined, turnstileToken.value);
    const { accessToken, refreshToken } = await api.remote.signin(email.value, password.value);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    api.mode = "remote";
    api.syncOnLogin().catch(() => {});
    router.push("/");
  } catch (error) {
    setAlert("error", "registerfailed");
    (window as any).turnstile?.reset();
    turnstileToken.value = null;
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
