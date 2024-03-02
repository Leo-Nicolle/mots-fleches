<template>
  <div class="loading">
    <RefreshCircleOutline />
    {{ $t('tooltips.loading') }}
  </div>
</template>

<script setup lang="ts">
import { RefreshCircleOutline } from '@vicons/ionicons5';

</script>

<style lang="css">
.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.loading>svg {
  width: 100px;
  height: 100px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
