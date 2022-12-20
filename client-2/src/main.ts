import { createApp } from 'vue';
import App from './App.vue';
import naive from 'naive-ui';
import router from './router';
const app = createApp(App).use(router).use(router);
app.use(naive);
// app.use(PrimeVue);
app.mount('#app');