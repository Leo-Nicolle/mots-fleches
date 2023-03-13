import { createApp } from 'vue';
import App from './App.vue';
import naive from 'naive-ui';
import VueHighlightJS from 'vue3-highlightjs';
import 'highlight.js/styles/monokai.css';

import router from './router';
const app = createApp(App)
  .use(router)
  .use(VueHighlightJS)
  .use(naive);

app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('svg:style')
};
app.mount('#app');