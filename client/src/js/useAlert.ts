import { ref } from 'vue';

export function useAlert() {
  const alert = ref<false | { type: string; id: string }>(false);
  return {
    alert,
    setAlert: (type: string, id: string) => {
      alert.value = { type, id };
      setTimeout(() => {
        alert.value = false;
      }, 3000);
    }
  };
}