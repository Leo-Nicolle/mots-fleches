

const onMessage = (event: MessageEvent) => {
  if (event.origin !== location.origin) return;
  if (event.data === "print") {
    window.print();
  }
};
export const usePrintMessage = () => {
  window.addEventListener("message", onMessage);
};
export const sendReadyMessage = () => {
  window.parent.postMessage("print-ready", location.origin);
};
export const sendDoneMessage = () => {
  window.parent.postMessage("print-done", location.origin);
};
export const cleanupPrintMessage = () => {
  window.removeEventListener("message", onMessage);
};