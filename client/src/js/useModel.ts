import { computed } from 'vue';

type modValProp<T> = {
  modelValue: T;
}
export function useModel<T= any>(props: modValProp<T>, emit: any) {
  return computed({
    get: () => props.modelValue,
    set: (value) => {
      return emit('update:modelValue', value as T);
    }
  });
}