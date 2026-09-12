<template>
  <div class="container">
    <h1>{{ $t("billing.completeYourPurchase") }}</h1>

    <!-- Plan Details Section -->
    <div class="plan-details">
      <h2>{{ props.plan.name }}</h2>
      <p>
        {{ formatPrice(props.plan.price, props.plan.currency) }}
        ({{ props.plan.billing === 'yearly' ? $t("plans.billing.yearly") : $t("plans.billing.monthly") }})
      </p>
    </div>

    <form class="payment-form" @submit.prevent="handlePayment">
      <h3>{{ $t("billing.billingDetails") }}</h3>
      <n-form>
        <n-form-item :label="$t('billing.name') + ' *'"
          :feedback="!billingDetails.name ? $t('billing.requiredField') : ''"
          :validation-status="!billingDetails.name ? 'error' : null">
          <n-input v-model:value="billingDetails.name" type="text" required />
        </n-form-item>

        <n-form-item :label="$t('billing.email') + ' *'" :feedback="!isEmailValid ? $t('billing.invalidEmail') : ''"
          :validation-status="!isEmailValid ? 'error' : null">
          <n-input v-model:value="billingDetails.email" type="email" required />
        </n-form-item>

        <n-form-item :label="$t('billing.address') + ' *'"
          :feedback="!billingDetails.address ? $t('billing.requiredField') : ''"
          :validation-status="!billingDetails.address ? 'error' : null">
          <n-input v-model:value="billingDetails.address" type="text" required />
        </n-form-item>

        <n-form-item :label="$t('billing.city') + ' *'"
          :feedback="!billingDetails.city ? $t('billing.requiredField') : ''"
          :validation-status="!billingDetails.city ? 'error' : null">
          <n-input v-model:value="billingDetails.city" type="text" required />
        </n-form-item>

        <n-form-item :label="$t('billing.zip') + ' *'"
          :feedback="!billingDetails.zip ? $t('billing.requiredField') : ''"
          :validation-status="!billingDetails.zip ? 'error' : null">
          <n-input v-model:value="billingDetails.zip" type="text" required />
        </n-form-item>
      </n-form>

      <h3>{{ $t("billing.paymentDetails") }}</h3>
      <div id="card-element" class="stripe-card-element"></div>
      <div v-if="cardError" class="error">{{ cardError }}</div>

      <div class="actions">
        <n-button size="large" @click="goBack">
          {{ $t("plans.goBack") }}
        </n-button>
        <n-button type="primary" size="large" attr-type="submit" :disabled="!isFormValid || isProcessing">
          {{ isProcessing ? $t("billing.processing") : $t("plans.proceedToPayment") }}
        </n-button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";

import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";
import { NButton, NInput, NForm, NFormItem } from "naive-ui";
import { api, Plan } from "database";

const props = defineProps<{ plan: Plan; publishableKey: string }>();
const emit = defineEmits<{
  (event: "paymentCompleted", value: void): void;
  (event: "goBack", value: void): void;
}>();

const billingDetails = reactive({
  name: "",
  email: "",
  address: "",
  city: "",
  zip: "",
});

const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingDetails.email));
const isFormValid = computed(() => billingDetails.name && billingDetails.email && isEmailValid.value);

const stripe = ref<Stripe | null>(null);
const elements = ref<StripeElements | null>(null);
const cardElement = ref(null);
const cardError = ref("");
const isProcessing = ref(false);

onMounted(async () => {
  api.remote.fetcher.get('/payments/billing-details')
    .then(res => {
      billingDetails.name = res.data.name || '';
      billingDetails.email = res.data.email || '';
      billingDetails.address = res.data.address || '';
      billingDetails.city = res.data.city || '';
      billingDetails.zip = res.data.zip || '';
      console.log('data', res.data);
    });
  stripe.value = await loadStripe(props.publishableKey);
  if (!stripe.value) {
    console.error("Stripe failed to load");
    return;
  }

  elements.value = stripe.value.elements();
  cardElement.value = elements.value.create("card", {
    hidePostalCode: true,
    disableLink: true
  });
  cardElement.value.mount("#card-element");
});

const handlePayment = async () => {
  try {
    if (!isFormValid.value) {
      console.error("Form is invalid");
      return;
    }

    if (!stripe.value || !elements.value) {
      console.error("Stripe is not initialized");
      return;
    }

    isProcessing.value = true;

    // Request Payment Intent from the backend
    const { data } = await api.remote.fetcher.post("/payments/subscribe", {
      productId: props.plan.productId,
      planId: props.plan.planId,
    });

    if (!data?.client_secret) {
      console.error("Missing client secret in response");
      return;
    }

    const secret = data.client_secret;
    // update custommer details
    await api.remote.fetcher.post('/payments/billing-details', billingDetails);
    // Confirm payment with Stripe Elements
    const result = await stripe.value.confirmCardPayment(secret, {
      payment_method: {
        card: cardElement.value,
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
          address: {
            line1: billingDetails.address,
            city: billingDetails.city,
            postal_code: billingDetails.zip,
          },
        },
      },
    });

    if (result.error) {
      cardError.value = result.error.message || "Payment failed";
      console.error("Payment failed:", result.error.message);
      isProcessing.value = false;
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      console.log("Payment succeeded!");
      emit("paymentCompleted");
    } else {
      console.error("Unexpected payment status:", result.paymentIntent?.status);
    }
  } catch (error) {
    console.error("Error during payment:", error);
  } finally {
    isProcessing.value = false;
  }
};

const goBack = () => {
  emit("goBack");
};

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price / 100); // Convert cents to dollars/euros
};
</script>

<style scoped>
.payment-form {
  width: 300px;
}

.plan-details {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.actions {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.stripe-card-element {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.error {
  color: red;
  font-size: 0.9em;
}
</style>