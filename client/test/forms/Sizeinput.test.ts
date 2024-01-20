import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Sizeinput from '../../src/components/forms/Sizeinput.vue';
import { NInputNumber, NSelect } from 'naive-ui';
describe.only('Sizeinput', () => {
  it('Should update modelValue', async () => {
    const wrapper = mount(Sizeinput, {
      global: {
        components: {
          'n-input-number': NInputNumber,
          'n-select': NSelect,
        },
      },
      props: {
        modelValue: '10cm',
        'onUpdate:modelValue': (e) => wrapper.setProps({ modelValue: e }),
      }
    });
    // get input type number
    const input = wrapper.find('input[type=text]');
    await input.setValue(20);
    expect(wrapper.props('modelValue')).toBe('20cm');
    // TODO: find a way to test select
    // const select = wrapper.find('select');
    // await select.setValue('pt');
    // expect(wrapper.props('modelValue')).toBe('20pt');
  });

});