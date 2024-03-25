import Plausible, { EventOptions } from 'plausible-tracker';

export const plausible = Plausible({
  hashMode: true,
  trackLocalhost: true,
  apiHost: 'https://motsflex.com/plausible'
});

function trackEventP(eventName: string, options?: EventOptions) {
  return new Promise((resolve, reject) => {
    plausible.trackEvent(eventName, {
      callback: resolve,
      ...options
    });
  });
}
const { trackEvent, trackPageview, } = plausible;
export { trackEvent, trackPageview, trackEventP };