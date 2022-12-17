import { computed } from 'vue';

export function useModel(props: any, emit: any) {
  return computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
}