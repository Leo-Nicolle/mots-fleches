import { createApp } from 'vue';
import App from './App.vue';
import naive from 'naive-ui';
import VueHighlightJS from 'vue3-highlightjs';
import 'highlight.js/styles/monokai.css';
import { i18n } from './i18n';
import router from './router';
import { plausible } from './js/plausible';

const app = createApp(App)
  .use(router)
  .use(VueHighlightJS)
  .use(naive)
  .use(i18n);

app.mount('#app');
plausible.enableAutoPageviews();