import Plausible, { EventOptions } from 'plausible-tracker';

export const plausible = Plausible({
  hashMode: false,
  trackLocalhost: false,
  apiHost: 'https://motsflex.com/plausible'
});

function postEvent(eventName: string, options?: EventOptions) {
  return new Promise((resolve, reject) => {
    plausible.trackEvent(eventName, {
      callback: resolve,
      ...options
    });
  });
}
const { trackEvent, trackPageview, } = plausible;

const PULSE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const PULSE_DEBOUNCE = 2000; // 2 seconds after last activity
let editPulseTimer: ReturnType<typeof setTimeout> | null = null;
let lastPulseSent = 0;

export function trackEditingActivity(context: 'grid' | 'style') {
  if (editPulseTimer) clearTimeout(editPulseTimer);
  editPulseTimer = setTimeout(() => {
    const now = Date.now();
    if (now - lastPulseSent >= PULSE_INTERVAL) {
      lastPulseSent = now;
      postEvent('editing-active', { props: { context } });
    }
  }, PULSE_DEBOUNCE);
}

export { trackEvent, trackPageview, postEvent };