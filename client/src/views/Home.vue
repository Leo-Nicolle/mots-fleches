<template>
  <Layout :left-panel-width="350" @scroll="onScrollThrottled">
    <template #left-panel>

      <ul>
        <li v-for="{ title, anchor, children } in menus" :key="anchor">
          <span @click="scrollTo(anchor)">{{ title }}</span>
          <ul v-if="children">
            <li v-for="{ title, anchor } in children" :key="anchor">
              <span @click="scrollTo(anchor)" :class="highlighted === anchor ? 'highlighted' : ''">{{ title }}</span>
            </li>
          </ul>
        </li>
      </ul>

    </template>
    <template #body>
      <div class="content" ref="content">
        <article>
          <section class="hero" id="top">
            <img src="/icon.svg" id="heroimage" />
            <h1>{{ $t("home.welcome.title") }}</h1>
            <p>{{ $t("home.welcome.p") }}</p>
          </section>
          <section id="wcid">
            <h2>{{ $t("home.nav.wcid") }}</h2>
            <p>
              {{ $t("home.wcid") }}
            </p>
          </section>
          <section id="grid-filling">
            <h3>{{ $t("home.nav.gridfilling") }}</h3>
            <p>
              {{ $t("home.gridfilling") }}
            </p>
            <video src="/filling-up-fast.mp4" controls />
          </section>
          <section id="definition-editing">
            <h3>{{ $t("home.nav.definitionediting") }}</h3>
            <p>
              {{ $t("home.definitionediting") }}
            </p>
            <video src="/editing-definition.mp4" controls />
          </section>
          <section id="check-mode">
            <h3>{{ $t("home.nav.checkmode") }}</h3>
            <p>
              {{ $t("home.checkmode") }}
            </p>
            <video src="/check-mode.mp4" controls />
          </section>
          <section id="styling">
            <h3>{{ $t("home.nav.styling") }}</h3>
            <p>
              {{ $t("home.styling") }}
            </p>
            <video src="/styling.mp4" controls />
          </section>
          <section id="printing">
            <h3>{{ $t("home.nav.printing") }}</h3>
            <p>
              {{ $t("home.printing") }}
            </p>
            <video src="/printing.mp4" controls />
          </section>
        </article>
        <article>
          <section id="manual">
            <h2>{{ $t("home.nav.howtouse") }}</h2>
            <p>
              {{ $t("home.howtouse") }}
            </p>
          </section>
          <section id="account">
            <h3>{{ $t("home.nav.account") }}</h3>
            <p v-html="$t('home.account')"></p>
          </section>
          <section id="grid-editor">
            <h2>{{ $t("home.nav.grideditor") }}</h2>
            <p>
              {{ $t("home.grideditor.p") }}
            </p>
            <ul v-html="$t('home.grideditor.list')"></ul>
          </section>
          <section id="resize">
            <h3>{{ $t("home.nav.resize") }}</h3>
            <p v-html="$t('home.resize.p')"></p>
            <ul v-html="$t('home.resize.list')"></ul>
          </section>
          <section id="customwords">
            <h3>{{ $t("home.nav.customwords") }}</h3>
            <p v-html="$t('home.customwords')"></p>
          </section>
          <section id="suggestions">
            <h3>{{ $t("home.nav.suggestions") }}</h3>
            <p>
              {{ $t("home.suggestions.one") }}
              <n-icon :size="'1.5em'">
                <Hammer />
              </n-icon>
              {{ $t("home.suggestions.two") }}
              <n-icon :size="'1.5em'">
                <Flash />
              </n-icon>.
              {{ $t("home.suggestions.three") }}
            </p>
          </section>
          <section id="heatmap">
            <h3>{{ $t("home.nav.heatmap") }}</h3>
            <p v-html="$t('home.heatmap')"></p>
          </section>
          <section id="langsupport">
            <h3>{{ $t("home.nav.languages") }}</h3>
            <p v-html="$t('home.languages')"></p>
          </section>
          <section id="langswitch">
            <h3>{{ $t("home.nav.langswitch") }}</h3>
            <p>
              {{ $t("home.langswitch.one") }}
              <n-icon size="1.5em">
                <LanguageOutline />
              </n-icon>
              {{ $t("home.langswitch.two") }}
            </p>
          </section>
        </article>
        <article>
          <section class="hero" id="about">
            <h1>{{ $t("home.nav.about") }}</h1>
            <p v-html="$t('home.about')"></p>
          </section>
          <section id="why">
            <h2>{{ $t("home.nav.why") }}</h2>
            <p v-html="$t('home.why')"></p>
          </section>
          <section id="who">
            <h2>{{ $t("home.nav.who") }}</h2>
            <p v-html="$t('home.who')"></p>
          </section>
          <section id="contribute">
            <h2>{{ $t("home.nav.contribute") }}</h2>
            <p v-html="$t('home.contribute')"></p>
          </section>
          <section id="support">
            <h2>{{ $t("home.nav.support") }}</h2>
            <p v-html="$t('home.support')"></p>
            <p></p>
          </section>
        </article>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Layout from "../layouts/Main.vue";
import throttle from "lodash/throttle";
import {
  LanguageOutline,
  Hammer,
  Flash,
} from "@vicons/ionicons5";
import { useThemeVars } from "naive-ui";
import { ref } from "vue";

const { t } = useI18n();
const theme = useThemeVars();
const highlighted = ref('');
type Menu = {
  title: string;
  anchor: string;
  children?: Menu[];
};
const menus = ref<Menu[]>([
  { title: 'Welcome', anchor: 'top' },
  {
    title: t('home.nav.wcid'),
    anchor: 'wcid',
    children: [
      { title: t('home.nav.gridfilling'), anchor: "#grid-filling" },
      { title: t('home.nav.definitionediting'), anchor: "#definition-editing" },
      { title: t('home.nav.checkmode'), anchor: "#check-mode" },
      { title: t('home.nav.styling'), anchor: "#styling" },
      { title: t('home.nav.printing'), anchor: "#printing" },
    ]
  },

  {
    title: t('home.nav.howtouse'), anchor: "#manual",
    children: [
      { title: t('home.nav.account'), anchor: "#account" },
      { title: t('home.nav.grideditor'), anchor: "#grid-editor" },
      { title: t('home.nav.resize'), anchor: "#resize" },
      { title: t('home.nav.customwords'), anchor: "#customwords" },
      { title: t('home.nav.suggestions'), anchor: "#suggestions" },
      { title: t('home.nav.heatmap'), anchor: "#heatmap" },
    ]
  },

  {
    title: t('home.nav.languages'), anchor: "#languages",
    children: [
      { title: t('home.nav.langsupport'), anchor: "#langsupport" },
      { title: t('home.nav.langswitch'), anchor: "#langswitch" },
    ]
  },
  {
    title: t('home.nav.about'),
    anchor: "#about",
    children: [
      { title: t('home.nav.why'), anchor: "#why" },
      { title: t('home.nav.who'), anchor: "#who" },
      { title: t('home.nav.contribute'), anchor: "#contribute" },
      { title: t('home.nav.support'), anchor: "#support" },
    ]
  }
]);

const anchors = menus.value.reduce((acc, { anchor, children }, i) => {
  acc.push(anchor);
  if (children) {
    children.forEach(({ anchor }, j) => {
      acc.push(anchor);
    });
  }
  return acc;
}, [] as string[]);
function scrollTo(anchor: string) {
  const el = document.querySelector(anchor);
  console.log(el);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: 'center' });
  }
}

function onScroll() {
  // get target scroll valule: 
  let found = false;
  const halfHeight = window.innerHeight / 2;
  for (let i = 0; i < anchors.length; i++) {
    const anchor = document.querySelector(anchors[i]);
    if (!anchor) continue;
    const { top, height } = anchor.getBoundingClientRect();
    if (top < halfHeight && top + height > halfHeight) {
      highlighted.value = anchors[i];
      found = true;
      break;
    }
  }
  if (!found) {
    highlighted.value = anchors[0];
  }
}

const onScrollThrottled = throttle(onScroll, 100);

</script>

<style lang="scss">
h1 {
  font-size: 2em;
}

div.content {
  max-width: 100%;
  padding: 0 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 500px;
  text-align: justify;
}

@media (max-width: 600px) {
  div.content {
    padding: 2px;
  }
}

div.content>article {
  width: 100%;
  box-sizing: border-box;
  max-width: 740px;
  padding: 0;
  margin: 30px 0;
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

.hero {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icontext {
  font-size: 1.5em;
}

#heroimage {
  width: 25%;
}

video {
  width: 100%;
}

kbd {
  border-radius: 3px;
  padding: 1px 2px 0;
  border: 1px solid black;
}
</style>

