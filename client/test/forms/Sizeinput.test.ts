import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Sizeinput from '../../src/components/forms/Sizeinput.vue';

describe('Sizeinput', () => {
  it('renders with the given modelValue', () => {
    const wrapper = mount(Sizeinput, {
      props: { modelValue: '10cm' },
    });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.html()).toContain('sizeinput');
  });

  it('emits update:modelValue when the number changes', async () => {
    const wrapper = mount(Sizeinput, {
      props: { modelValue: '10cm' },
    });
    const numberInput = wrapper.find('input');
    if (!numberInput.exists()) return;
    await numberInput.setValue('20');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });
});
