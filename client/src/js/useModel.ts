import { computed } from 'vue';

export function useModel<T= any>(props: any, emit: any) {
  return computed({
    get: () => props.modelValue,
    set: (value) => {
      return emit('update:modelValue', value as T);
    }
  });
}