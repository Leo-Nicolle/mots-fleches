<template>

  <Layout :title="$t('plans.title')" :left-panel-width="0">
    <template v-slot:body>
      <div class="container">
        <Plans :currentStep="selectedPlan" v-if="currentStep === 'plans'" @planSelected="handlePlanSelected" />
        <ConfirmSelection v-else-if="currentStep === 'confirmSelection' && selectedPlan" :plan="selectedPlan"
          @confirm="handleConfirmSelection" @goBack="currentStep = 'plans'" />
        <Payment v-else-if="currentStep === 'payment' && selectedPlan" :plan="selectedPlan"
          @paymentCompleted="handlePaymentCompleted" />
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Layout from "../../layouts/Main.vue";
import Plans from "./Plans.vue";
import ConfirmSelection from "./Confirm-selection.vue";
import Payment from "./Payment.vue";
import { Plan } from "database";

// Steps in the payment process
const steps = {
  plans: Plans,
  confirmSelection: ConfirmSelection,
  payment: Payment,
};
// Current step in the process
const currentStep = ref("plans");

// Selected plan data
const selectedPlan = ref<Plan | null>(null);

// Handle when a plan is selected
const handlePlanSelected = (plan: Plan) => {
  selectedPlan.value = plan;
  currentStep.value = "confirmSelection";
};

// Handle when the user confirms their selection
const handleConfirmSelection = () => {
  currentStep.value = "payment";
};

// Handle when the payment is completed
const handlePaymentCompleted = () => {
  // Redirect to a success page or show a success message
  console.log("Payment completed successfully!");
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  width: 100%;
}
</style>