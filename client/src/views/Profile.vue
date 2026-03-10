<template>
  <Layout :left-panel-width="0">
    <template v-slot:body>
      <div class="profile-container">
        <h1>{{ $t("profile.title") }}</h1>

        <!-- Email Section -->
        <section class="profile-section">
          <h2>{{ $t("profile.email") }}</h2>
          <p>{{ user.email }}</p>
        </section>

        <!-- Change Password Section -->
        <section class="profile-section">
          <h2>{{ $t("profile.changePassword") }}</h2>
          <n-form @submit.prevent="changePassword">
            <n-form-item :label="$t('profile.currentPassword')">
              <n-input v-model="passwords.current" type="password" required />
            </n-form-item>
            <n-form-item :label="$t('profile.newPassword')">
              <n-input v-model="passwords.new" type="password" required />
            </n-form-item>
            <n-form-item :label="$t('profile.confirmPassword')">
              <n-input v-model="passwords.confirm" type="password" required />
            </n-form-item>
            <n-button type="primary" attr-type="submit">{{ $t("profile.updatePassword") }}</n-button>
          </n-form>
        </section>

        <!-- Billing Details Section -->
        <!--          
        <section class="profile-section">
          <h2>{{ $t("profile.billingDetails") }}</h2>
          <p><strong>{{ $t("profile.billingName") }}:</strong> {{ billing.name }}</p>
          <p><strong>{{ $t("profile.billingEmail") }}:</strong> {{ billing.email }}</p>
          <p><strong>{{ $t("profile.billingAddress") }}:</strong> {{ billing.address }}</p>
          <p><strong>{{ $t("profile.billingCity") }}:</strong> {{ billing.city }}</p>
          <p><strong>{{ $t("profile.billingZip") }}:</strong> {{ billing.zip }}</p>
        </section> -->
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { NForm, NFormItem, NInput, NButton } from "naive-ui";
import { api } from "../api";
import Layout from "../layouts/Main.vue";

const user = reactive({
  email: "",
});

const passwords = reactive({
  current: "",
  new: "",
  confirm: "",
});

const billing = reactive({
  name: "",
  email: "",
  address: "",
  city: "",
  zip: "",
});

const fetchUserData = async () => {
  try {
    const { data } = await api.remote.fetcher.get("/profile");
    user.email = data.email;
    billing.name = data.billing?.name || "";
    billing.email = data.billing?.email || "";
    billing.address = data.billing?.address || "";
    billing.city = data.billing?.city || "";
    billing.zip = data.billing?.zip || "";
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

const changePassword = async () => {
  if (passwords.new !== passwords.confirm) {
    console.error("Passwords do not match");
    return;
  }
  try {
    await api.remote.fetcher.post("/auth/change-password", {
      currentPassword: passwords.current,
      newPassword: passwords.new,
    });
    passwords.current = "";
    passwords.new = "";
    passwords.confirm = "";
  } catch (error) {
    console.error("Error updating password:", error);
  }
};

onMounted(() => {
  fetchUserData();
});
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-section {
  margin-bottom: 30px;
}

.profile-section h2 {
  margin-bottom: 10px;
}

.profile-section ul {
  list-style: none;
  padding: 0;
}

.profile-section ul li {
  margin-bottom: 5px;
}
</style>
