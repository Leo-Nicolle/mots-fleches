

const onMessage = (event: MessageEvent) => {
  if (event.origin !== location.origin) return;
  if (event.data === "print") {
    window.print();
  }
};
export const usePrintMessage = () => {
  window.addEventListener("message", onMessage);
};

export const cleanupPrintMessage = () => {
  window.removeEventListener("message", onMessage);
};