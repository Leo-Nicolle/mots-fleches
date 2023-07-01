<template>
  <Layout :title="$t('login.title')" :alert="alert">
    <template #default>
      <n-form-item :label="$t('login.email')" path="login">
        <n-input
          role="login"
          type="text"
          placeholder="name@mail.com"
          v-model:value="email"
        />
      </n-form-item>
      <n-form-item :label="$t('login.password')" path="password">
        <n-input
          role="password"
          type="password"
          placeholder="password"
          v-model:value="password"
        ></n-input>
      </n-form-item>
      <span class="forgot-password hidden" @click="onForgotPassword">
        {{ $t("login.forgotPassword") }}
      </span>
    </template>
    <template #footer>
      <n-button class="login-btn" disabled type="primary" @click="emailLogin">{{
        $t("login.login")
      }}</n-button>
      <n-button class="login-btn" disabled type="info" @click="createAccount">{{
        $t("login.register")
      }}</n-button>
      <n-button class="login-btn" type="primary" @click="localMode">{{
        $t("login.localMode")
      }}</n-button>
    </template>

    <template #action>
      <!-- {{ $t("login.githubLogin") }}
      <div class="third-parties">
        <n-button circle @click="() => login('github')">
          <n-icon size="2em">
            <LogoGithub />
          </n-icon>
        </n-button>
      </div> -->
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { api } from "../../api";
import Layout from "../../layouts/NotLoggedin.vue";
import { LogoGithub } from "@vicons/ionicons5";
import { useRoute, useRouter } from "vue-router";
import { useAlert } from "../../js/useAlert";
const router = useRouter();
const email = ref<string>("");
const password = ref<string>("");
const { alert, setAlert } = useAlert();
const route = useRoute();
async function login(method: string) {
  const { data, error } = api.supadb.supabase.auth.signInWithOAuth({
    provider: method,
  });
  if (error) {
    return setAlert("error", "wrongpassword");
  }
  api.mode = "supadb";
  router.push("/");
}
async function emailLogin() {
  const { data, error } = await api.supadb.supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) {
    alert.value = { type: "error", id: "wrongpassword" };
    setTimeout(() => {
      alert.value = false;
    }, 3000);
  } else {
    api.mode = "supadb";
    router.push("/");
  }
}
async function onForgotPassword() {
  const { data, error } = await api.supadb.supabase.auth.signInWithOtp({
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
  router.push("/");
}
</script>

<style>
.third-parties {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.forgot-password {
  color: #888;
  font-style: italic;
  cursor: pointer;
}
.forgot-password:hover {
  color: #000;
  text-decoration: underline;
}
.hidden{
  display: none;
}
</style>

