import { describe, expect, it } from 'vitest';
import { mount, wait } from '../utils';
import Vue from 'vue';
import Sizeinput from '../../src/components/forms/Sizeinput.vue';
describe.only('Sizeinput', () => {
  it('Should update modelValue', async () => {
    const wrapper = mount(Sizeinput, {
      props: {
        modelValue: '10cm',
        'onUpdate:modelValue': (e) => wrapper.setProps({ modelValue: e }),
      }
    });
    // get input type number
    const input = wrapper.find('input[type=text]');
    document.body.appendChild(input.element);
    await input.setValue(20);

    // const select = wrapper.find('.n-select>div');
    // await select.trigger('click');
    await wrapper.find('.n-base-selection').trigger('click');
    await wait(100);
    debugger;
    const a = document.querySelector('.v-vl-visible-items');
    console.log(a);
    // const option = wrapper.findAll('.n-base-select-option')
    //   .find((option) => option.text() === 'pt');
    // await option.trigger('click');
    expect(wrapper.props('modelValue')).toBe('20pt');
    // TODO: find a way to test select
    // const select = wrapper.find('select');
    // await select.setValue('pt');
    // expect(wrapper.props('modelValue')).toBe('20pt');
  });

});