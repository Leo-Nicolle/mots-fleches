import { ComponentMountingOptions, mount as m, } from '@vue/test-utils';

export function mount<T>(cp, options: ComponentMountingOptions<T> = {}) {
  return m(cp, {
    // global: {
    // components: {
    // 'n-input-number': NInputNumber,
    // 'n-select': NSelect,
    // },
    // },
    props: options.props,
  });
}

export function wait(ms = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}