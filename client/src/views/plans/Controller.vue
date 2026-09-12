<template>
  <Layout :title="$t('plans.title')" :left-panel-width="0">
    <template v-slot:body>
      <Index />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Layout from "../../layouts/Main.vue";
import Index from "./Index.vue";
import { api } from "../../api";
const isDev = import.meta.env.DEV;
const currentStep = ref("plans");
const selectedPlan = ref(null);
const plans = ref([]);
const publishableKey = ref("");
const checkoutIframe = ref(null);
const src = ref(null);
const fetchPlans = async () => {
  const response = await api.remote.getPlans();
  plans.value = response.plans;
  publishableKey.value = response.publishableKey;
};

const handlePaymentCompleted = () => {
  console.log("Payment completed successfully!");
  currentStep.value = "plans";
};
const onClick = () => {
  src.value = isDev ? 'http://localhost:5177' : 'https://checkout.motsflex.com';
};

onMounted(() => {
  fetchPlans();

  window.addEventListener("message", (event) => {
    if (event.data.event === "paymentCompleted") {
      handlePaymentCompleted();
    }
  });
});
</script>
