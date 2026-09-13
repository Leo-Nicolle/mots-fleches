import Plausible, { EventOptions } from 'plausible-tracker';

export const plausible = Plausible({
  domain: 'motsflex.com',
  hashMode: false,
  trackLocalhost: false,
  apiHost: 'https://motsflex.com/plausible'
});

function isLoggedIn(): boolean {
  const mode = localStorage.getItem('db-mode');
  return mode === 'remote' || mode === 'supadb';
}

function postEvent(eventName: string, options?: EventOptions) {
  const { props, ...rest } = options || {};
  return new Promise((resolve, reject) => {
    plausible.trackEvent(eventName, {
      callback: resolve,
      props: { loggedin: isLoggedIn(), ...props },
      ...rest
    });
  });
}

const { trackEvent, trackPageview, } = plausible;

function trackPageviewForRoute(name: string) {
  const path = name === 'home' ? '/' : `/${name}`;
  trackPageview(
    { url: `${window.location.origin}${path}` },
    { props: { loggedin: isLoggedIn() } }
  );
}

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

export { trackEvent, trackPageview, postEvent, trackPageviewForRoute };
