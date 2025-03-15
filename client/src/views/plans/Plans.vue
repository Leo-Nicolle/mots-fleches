<template>
  <div class="container">
    <h1>
      {{ $t("plans.title") }}
    </h1>
    <div class="billing-toggle">
      <n-button :type="!isYearly ? 'primary' : 'default'" @click="isYearly = false" size="large">
        {{ $t("plans.billing.monthly") }}
      </n-button>
      <n-button :type="isYearly ? 'primary' : 'default'" @click="isYearly = true" size="large">
        {{ $t("plans.billing.yearly") }}
      </n-button>
    </div>

    <!-- Plans -->
    <div class="plans-container">
      <!-- Free Plan -->
      <n-card class="plan-card" :bordered="selectedPlan === 'free'" @click="selectPlan('free')">
        <template #header>
          <h2>Free</h2>
        </template>

        <p class="price">Free</p>

        <ul class="features">
          <li>No server capabilities</li>
          <li>Everything is saved locally</li>
        </ul>

        <template #footer>
          <n-button type="primary" block @click.stop="confirmPlan('free')">
            {{ $t("plans.select") }}
          </n-button>
        </template>
      </n-card>

      <!-- Paid Plans -->
      <n-card v-for="plan in filteredPlans" :key="plan.nickname" class="plan-card"
        :bordered="selectedPlan === plan.nickname" @click="selectPlan(plan.nickname)">
        <template #header>
          <h2>{{ plan.name }}</h2>
        </template>

        <p class="price">{{ formatPrice(plan.price, plan.currency) }}</p>

        <ul class="features">
          <li>
            {{ $t("plans.limits.grids") }}: {{ plan.limits.grids }}
          </li>
          <li>
            {{ $t("plans.limits.custom_words") }}: {{ plan.limits.custom_words }}
          </li>
          <li>
            {{ $t("plans.limits.word_lists") }}: {{ plan.limits.word_lists }}
          </li>
          <li>
            {{ $t("plans.limits.max_list_size") }}: {{ plan.limits.max_list_size }}
          </li>
        </ul>

        <template #footer>
          <n-button type="primary" block @click.stop="confirmPlan(plan)">
            {{ $t("plans.select") }}
          </n-button>
        </template>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineEmits } from "vue";
import { NCard, NButton } from "naive-ui";
import { api } from "../../api";
import { type Plan } from "database";

const selectedPlan = ref<string | null>(null);
const isYearly = ref<boolean>(false);
const plans = ref<Plan[]>([]);
const emit = defineEmits<{
  (event: "planSelected", value: Plan): void;
}>();
// Fetch plans from the server
const fetchPlans = async () => {
  try {
    const response = await api.remote.getPlans();
    plans.value = response.plans.sort((a, b) => a.price - b.price);
  } catch (error) {
    console.error("Error fetching plans:", error);
  }
};

// Filter plans based on the selected billing cycle
const filteredPlans = computed(() =>
  plans.value.filter((plan) => plan.period === (isYearly.value ? "yearly" : "monthly"))
);

// Format price for display
const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price / 100); // Convert cents to dollars/euros
};

const selectPlan = (planId: string) => {
  selectedPlan.value = planId;
};

const confirmPlan = (plan: Plan) => {
  emit('planSelected', plan);
};

// Fetch plans on component mount
onMounted(fetchPlans);
</script>

<style scoped>
.container {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.billing-toggle {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 16px;
}

.plans-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
}

.plan-card {
  width: 280px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  border: 1px solid #ddd;
  /* Add a light border */
  border-radius: 8px;
  /* Rounded corners */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* Subtle shadow */
  background-color: #fff;
  /* Ensure a white background */
  padding: 16px;
  /* Add some padding inside the card */
}

h2 {
  margin-bottom: 0;
}


.plan-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  /* Stronger shadow on hover */
}

.price {
  font-size: 1.5em;
  font-weight: bold;
  text-align: center;
}

.features {
  list-style: none;
  padding: 0;
  text-align: left;
}
</style>
