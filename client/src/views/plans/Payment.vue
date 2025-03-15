<template>
  <div class="container">
    <h1>{{ $t("billing.title") }}</h1>

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
      <n-form>
        <n-form-item :label="$t('billing.cardNumber') + ' *'"
          :feedback="!isCardNumberValid ? $t('billing.invalidCardNumber') : ''"
          :validation-status="!isCardNumberValid ? 'error' : null">
          <n-input v-model:value="formattedCardNumber" type="text" @input="formatCardNumber" maxlength="19"
            placeholder="1234 5678 9012 3456" required />
        </n-form-item>

        <n-form-item :label="$t('billing.expiry') + ' *'" :feedback="!isExpiryValid ? $t('billing.invalidExpiry') : ''"
          :validation-status="!isExpiryValid ? 'error' : null">
          <n-input v-model:value="formatedExpiry" type="text" @input="validateExpiry" placeholder="MM/YY" required />
        </n-form-item>

        <n-form-item :label="$t('billing.cvc') + ' *'" :feedback="!isCVCValid ? $t('billing.invalidCVC') : ''"
          :validation-status="!isCVCValid ? 'error' : null">
          <n-input v-model:value="formatedCVC" type="text" @input="validateCVC" maxlength="4" required />
        </n-form-item>
      </n-form>

      <div class="actions">
        <n-button type="primary" size="large" html-type="submit" :disabled="!isFormValid">
          {{ $t("plans.proceedToPayment") }}
        </n-button>
        <n-button size="large" @click="goBack">
          {{ $t("plans.goBack") }}
        </n-button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { defineProps, defineEmits } from "vue";
import { NButton, NInput, NForm, NFormItem } from "naive-ui";
import { Plan } from "database";

const props = defineProps<{ plan: Plan }>();
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

const paymentDetails = reactive({
  cardNumber: "",
  expiry: "",
  cvc: "",
});

// Computed formatted card number
const formattedCardNumber = ref("");
const formatedExpiry = ref("");
const formatedCVC = ref("");
// Validation states
const isCardNumberValid = ref(true);
const isExpiryValid = ref(true);
const isCVCValid = ref(true);
const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingDetails.email));

// Computed property to check if the form is valid
const isFormValid = computed(
  () =>
    billingDetails.name &&
    billingDetails.email &&
    isEmailValid.value &&
    billingDetails.address &&
    billingDetails.city &&
    billingDetails.zip &&
    isCardNumberValid.value &&
    isExpiryValid.value &&
    isCVCValid.value
);

// Format card number (add spaces every 4 digits)
const formatCardNumber = (value: string) => {
  paymentDetails.cardNumber = value
    .replace(/\D/g, "").substring(0, 16);
  formattedCardNumber.value = value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim();
  isCardNumberValid.value = paymentDetails.cardNumber.length === 16
    && luhnCheck(paymentDetails.cardNumber);
};

// Validate expiry date (MM/YY format)
const validateExpiry = (value: string) => {
  // remove everything except digits
  value = value.replace(/\D/g, "")
    .slice(0, 4);
  // add a slash after the first two digits
  if (value.length >= 2) {
    value = value.substring(0, 2) + "/" + value.substring(2);
  }
  const [month, year] = value.split("/").map((v) => parseInt(v, 10));
  const now = new Date();
  const currentYear = parseInt(now.getFullYear().toString().slice(-2), 10);
  const currentMonth = now.getMonth() + 1;
  formatedExpiry.value = value;
  paymentDetails.expiry = value;
  isExpiryValid.value =
    /^[0-9]{2}\/[0-9]{2}$/.test(paymentDetails.expiry) &&
    month >= 1 &&
    month <= 12 &&
    (year > currentYear || (year === currentYear && month >= currentMonth));
};

// Validate CVC (3 or 4 digits)
const validateCVC = (value: string) => {
  formatedCVC.value = value.replace(/\D/g, "").substring(0, 4);
  paymentDetails.cvc = value.replace(/\D/g, "").substring(0, 4);
  isCVCValid.value = /^[0-9]{3,4}$/.test(paymentDetails.cvc);
};

// Luhn algorithm for card number validation
const luhnCheck = (num: string) => {
  let sum = 0;
  let shouldDouble = false;

  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

const handlePayment = () => {
  emit("paymentCompleted");
};

const goBack = () => {
  emit("goBack");
};
</script>
