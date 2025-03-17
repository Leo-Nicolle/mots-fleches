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

        <!-- Plan Details Section -->
        <section class="profile-section">
          <h2>{{ $t("profile.planDetails") }}</h2>
          <p>
            <strong>{{ plan.name }}</strong> -
            {{ formatPrice(plan.price, plan.currency) }}
            ({{ plan.billing === 'yearly' ? $t("plans.billing.yearly") : $t("plans.billing.monthly") }})
          </p>
          <ul>
            <li>{{ $t("plans.limits.grids") }}: {{ plan.limits.grids }}</li>
            <li>{{ $t("plans.limits.custom_words") }}: {{ plan.limits.custom_words }}</li>
            <li>{{ $t("plans.limits.word_lists") }}: {{ plan.limits.word_lists }}</li>
            <li>{{ $t("plans.limits.max_list_size") }}: {{ plan.limits.max_list_size }}</li>
          </ul>
          <n-button type="primary" @click="upgradePlan">{{ $t("profile.upgradePlan") }}</n-button>
        </section>

        <!-- Billing Details Section -->
        <section class="profile-section">
          <h2>{{ $t("profile.billingDetails") }}</h2>
          <p><strong>{{ $t("profile.billingName") }}:</strong> {{ billing.name }}</p>
          <p><strong>{{ $t("profile.billingEmail") }}:</strong> {{ billing.email }}</p>
          <p><strong>{{ $t("profile.billingAddress") }}:</strong> {{ billing.address }}</p>
          <p><strong>{{ $t("profile.billingCity") }}:</strong> {{ billing.city }}</p>
          <p><strong>{{ $t("profile.billingZip") }}:</strong> {{ billing.zip }}</p>
        </section>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { NForm, NFormItem, NInput, NButton } from "naive-ui";
import { api } from "database";
import Layout from "../layouts/Main.vue";

const router = useRouter();
const user = reactive({
  email: "",
});

const passwords = reactive({
  current: "",
  new: "",
  confirm: "",
});

const plan = reactive({
  name: "",
  price: 0,
  currency: "USD",
  billing: "monthly",
  limits: {
    grids: 0,
    custom_words: 0,
    word_lists: 0,
    max_list_size: 0,
  },
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
    console.log("User data:", data);
    user.email = data.email;
    plan.name = data.tier;
    plan.price = data.billing.price || 0;
    plan.currency = data.billing.currency || "USD";
    plan.billing = data.billing.period || "monthly";
    plan.limits = data.limits || {};

    billing.name = data.billing.name || "";
    billing.email = data.billing.email || "";
    billing.address = data.billing.address || "";
    billing.city = data.billing.city || "";
    billing.zip = data.billing.zip || "";
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

const changePassword = async () => {
  if (passwords.new !== passwords.confirm) {
    alert("Passwords do not match!");
    return;
  }
  try {
    await api.remote.fetcher.post("/user/change-password", {
      currentPassword: passwords.current,
      newPassword: passwords.new,
    });
    alert("Password updated successfully!");
    passwords.current = "";
    passwords.new = "";
    passwords.confirm = "";
  } catch (error) {
    console.error("Error updating password:", error);
    alert("Failed to update password.");
  }
};

const upgradePlan = () => {
  router.push("/subscribe");
};

onMounted(() => {
  fetchUserData();
});

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price / 100); // Convert cents to dollars/euros
};
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