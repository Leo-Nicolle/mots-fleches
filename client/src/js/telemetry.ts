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
export { trackEvent, trackPageview, postEvent };