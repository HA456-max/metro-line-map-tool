// swRegister.ts - register service worker and dispatch update events
export function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.onupdatefound = () => {
        const inst = reg.installing;
        if (!inst) return;
        inst.onstatechange = () => {
          if (inst.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              window.dispatchEvent(new CustomEvent('swUpdated'));
            } else {
              window.dispatchEvent(new CustomEvent('swReady'));
            }
          }
        };
      };
    }).catch(console.error);
  }
}
