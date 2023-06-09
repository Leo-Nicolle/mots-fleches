<template>
  <div class="signin">
    <n-card title="Please sign in" class="login">
      <template #default>
        <n-form-item :label="$t('forms.email')" path="login">
          <n-input
            role="login"
            type="text"
            placeholder="name@mail.com"
            v-model:value="email"
          />
        </n-form-item>
        <n-form-item :label="$t('forms.password')" path="password">
          <n-input
            role="password"
            type="password"
            placeholder="password"
            v-model:value="password"
          ></n-input>
        </n-form-item>
      </template>
      <template #footer>
        <n-collapse-transition :show="alert">
          <span class="alert"> Wrong email or password </span>
        </n-collapse-transition>
        <div class="footer">
          <n-button class="login-btn" type="primary" @click="emailLogin"
            >Log in</n-button
          >
          <n-button class="login-btn" type="info" @click="createAccount"
            >Create an account</n-button
          >
          <n-button class="login-btn" type="primary" @click="localMode"
            >Local Mode</n-button
          >
        </div>
      </template>

      <template #action>
        Login via github:
        <div class="third-parties">
          <n-button circle @click="() => login('github')">
            <n-icon size="2em">
              <LogoGithub />
            </n-icon>
          </n-button>
          <!-- <n-button circle @click="() =>login('google')">
            <n-icon size="2em">
              <LogoGoogle />
            </n-icon>
          </n-button>
          <n-button circle @click="() =>login('gitlab')">
            <n-icon size="2em">
              <LogoGitlab />
            </n-icon>
          </n-button>
          <n-button circle>
            <n-icon size="2em" @click="() =>login('discord')">
              <LogoDiscord />
            </n-icon>
          </n-button> -->
        </div>
      </template>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../api";
import {
  LogoGithub,
  LogoGoogle,
  LogoGitlab,
  LogoDiscord,
} from "@vicons/ionicons5";
import { useThemeVars } from "naive-ui";
import { useRouter } from "vue-router";
const router = useRouter();
const email = ref<string>("");
const password = ref<string>("");
const alert = ref<false | { type: string; id: string }>(false);
const {errorColor} = useThemeVars().value;
async function login(method: string) {
  const { data, error } = api.supadb.supabase.auth.signInWithOAuth({
    provider: method,
  });
  if (error){
    alert.value = { type: "error", id: "wrongpassword" };
    setTimeout(() => {
      alert.value = false;
    }, 3000);
  } else {
    api.mode = 'supadb';
    router.push("/grids");
  }
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
    api.mode = 'supadb';
    router.push("/grids");
  }
}

async function localMode() {
  api.mode = 'idb';
  router.push('/grids');
}

</script>

<style scoped>
.signin {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
}
.login {
  max-width: 400px;
}
.third-parties {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.footer {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.alert {
  color: v-bind(errorColor);
  line-height: 3em;
}
</style>

