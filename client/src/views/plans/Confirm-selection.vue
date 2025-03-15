<template>
  <div class="container">
    <h1>{{ $t("plans.confirmationTitle") }}</h1>
    <div class="plan-details">
      <h2>{{ plan.name }}(
        {{ formatPrice(plan.price, plan.currency) }}
        {{ plan.billing === 'yearly' ? $t("plans.billing.yearly") : $t("plans.billing.monthly") }}
        )</h2>
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
    </div>

    <div class="actions">
      <n-button type="primary" size="large" @click="proceedToPayment">
        {{ $t("plans.proceedToPayment") }}
      </n-button>
      <n-button size="large" @click="goBack">
        {{ $t("plans.goBack") }}
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import { NButton } from "naive-ui";
import { Plan } from 'database';
const props = defineProps<{ plan: Plan }>();
const emit = defineEmits<{
  (event: "confirm", value: Plan): void;
  (event: "goBack", value: void): void;
}>();

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price / 100); // Convert cents to dollars/euros
};

const proceedToPayment = () => {
  emit("confirm", props.plan);
};

const goBack = () => {
  emit("goBack");
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.plan-details {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  width: 100%;
  max-width: 400px;
}

.price {
  font-size: 1.5em;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.features {
  list-style: none;
  padding: 0;
  text-align: left;
}

.actions {
  display: flex;
  gap: 10px;
}
</style>