import { ref } from "vue";

export type ScreenSize = 'phone' | 'tablet' | 'desktop';

export const useResponsive = () => {
  const screenSize = ref<ScreenSize>('desktop');
  const onResize = () => {
    screenSize.value = window.innerWidth < 768 ? 'phone' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
  };
  const cleanupUseResponsive = () => {
    window.removeEventListener("resize", onResize);
  };
  window.addEventListener("resize", onResize);
  onResize();
  return {
    screenSize,
    onResize,
    cleanupUseResponsive
  }
};
