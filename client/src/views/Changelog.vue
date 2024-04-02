<template>
  <Layout :breadcrumbs="[{ text: 'Changelog' }]" :left-panel-width="200" @scroll="onScrollThrottled">
    <template #left-panel>
      <ul>
        <li v-for="{ title, anchor } in menus" :key="anchor">
          <span :class="highlighted === anchor ? 'highlighted' : ''" @click="scrollTo(anchor)">{{ title }}</span>
        </li>
      </ul>

    </template>
    <template #body>
      <div class="content" ref="content">
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "../layouts/Main.vue";
import throttle from "lodash/throttle";
import { useThemeVars } from "naive-ui";
import { ref } from "vue";
import { onMounted } from "vue";
import axios from "axios";
import markdownit from 'markdown-it';
const content = ref(null);
const md = markdownit();
const theme = useThemeVars();
const highlighted = ref('');
type Menu = {
  title: string;
  anchor: string;
};

type Article = {
  date: string;
  text: string;
  before?: string;
  after?: string;
};
const arcticles = ref<Article[]>([
  { date: '2021-01-01', text: 'This is the' }
]);
const menus = ref<Menu[]>([]);

function scrollTo(title: string) {
  const el = [...document.querySelectorAll('h3')]
    .find(e => e.textContent === title);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: 'center' });
}

function onScroll() {
  // get target scroll valule: 
  debugger;
  let found = false;
  const acs = menus.value.map(e => e.anchor);
  // const halfHeight = window.innerHeight / 2;
  const els = [...document.querySelectorAll('h3')];
  for (let i = 0; i < acs.length; i++) {
    const anchor = els.find(e => e.textContent === acs[i]);
    console.log(anchor);
    if (!anchor) continue;
    const { top, height } = anchor.getBoundingClientRect();
    if (top > 0) {
      highlighted.value = acs[i];
      found = true;
      break;
    }
  }
  if (!found) {
    highlighted.value = acs[0];
  }
}

const onScrollThrottled = throttle(onScroll, 100);

onMounted(() => {
  axios.get('/changelog.md').then(res => {
    menus.value = res.data.match(/###(.*)/g)
      .map(e => e.replace('###', '').trim())
      .map(e => ({ title: e, anchor: e }));
    console.log(menus.value);
    content.value.innerHTML = md.render(res.data);
  });
})

</script>

<style lang="scss" scoped>
h3 {
  font-size: 2em;
}

.left-panel ul {
  list-style: none;
  padding: 0;
  margin-left: 1rem;
  font-size: 1em;
  display: flex;
  flex-direction: column;
  line-height: 2rem;
}

.left-panel ul li>span:hover {
  cursor: pointer;
  color: v-bind('theme.primaryColorHover');
  text-decoration: underline;
}

span.highlighted {
  color: v-bind('theme.primaryColor');
}
</style>
