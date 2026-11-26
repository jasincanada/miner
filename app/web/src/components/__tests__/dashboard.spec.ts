import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ChristmasScene from '../ChristmasScene.vue';
import PipelineSection from '../PipelineSection.vue';
import ProofSection from '../ProofSection.vue';

describe('ChristmasScene (Slice 1 placeholder)', () => {
  it('renders the static scene, hidden from assistive tech', () => {
    const wrapper = mount(ChristmasScene);
    expect(wrapper.find('.scene').exists()).toBe(true);
    expect(wrapper.find('.scene').attributes('aria-hidden')).toBe('true');
    // No canvas engine and no Rive runtime in this slice — by design.
    expect(wrapper.find('canvas').exists()).toBe(false);
  });
});

describe('PipelineSection', () => {
  it('carries the four steps of the static reference page', () => {
    const wrapper = mount(PipelineSection);
    const titles = wrapper.findAll('.step h3').map((n) => n.text());
    expect(titles).toEqual([
      'You call',
      'It records',
      'It transcribes',
      'You get email',
    ]);
  });
});

describe('ProofSection', () => {
  it('keeps Fo’s test-call words intact', () => {
    const wrapper = mount(ProofSection);
    expect(wrapper.find('blockquote').text()).toContain(
      'This is Fo speaking clearly for your test',
    );
  });
});
