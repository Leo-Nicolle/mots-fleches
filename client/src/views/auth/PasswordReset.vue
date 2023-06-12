<template>
  <Layout :title="$t('passwordreset.title')" :alert="alert">
    <template #default>
      <n-form-item :label="$t('register.password')" path="password">
        <n-input
          role="password"
          type="password"
          placeholder="password"
          v-model:value="password"
        ></n-input>
      </n-form-item>
      <n-form-item :label="$t('register.confirmPassword')" path="password">
        <n-input
          role="passwordcheck"
          type="password"
          placeholder="passwordcheck"
          v-model:value="passwordcheck"
        ></n-input>
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
import { useAlert } from "../../js/useAlert";
import Layout from "../../layouts/NotLoggedin.vue";
import { useRoute, useRouter } from "vue-router";
const router = useRouter();
const password = ref<string>("");
const passwordcheck = ref<string>("");
const { alert, setAlert } = useAlert();
const route = useRoute();
const [key, hash] = location.hash.split("=");
async function register(method: string) {
  if (password.value !== passwordcheck.value) {
    return setAlert("error", "passwordsdontmatch");
  }
  if (password.value.length < 6) {
    return setAlert("error", "passwordtooshort");
  }
  const { data, error } = await api.supadb.supabase.auth.updateUser({
    password: password.value,
  });
  if (error) {
    console.log(
      "Error: ",
      error.cause,
      error.message,
      error.name,
      error.status
    );
    const id = error.message.includes(
      "Password should be at least 6 characters"
    )
      ? "passwordtooshort"
      : "wrongpassword";
    alert.value = { type: "error", id };
    setTimeout(() => {
      alert.value = false;
    }, 3000);
  } else {
    api.mode = "supadb";
    router.push("/");
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

