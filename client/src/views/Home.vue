<template>
  <Layout :left-panel-width="350">
    <template #left-panel>
      <n-anchor class="left-menu" :show-rail="false" :show-background="true" :affix="false">
        <n-anchor-link title="Welcome" href="#top" />
        <n-anchor-link :title="$t('home.nav.wcid')" href="#wcid">
          <n-anchor-link :title="$t('home.nav.gridfilling')" href="#grid-filling" />
          <n-anchor-link :title="$t('home.nav.definitionediting')" href="#definition-editing" />
          <n-anchor-link :title="$t('home.nav.checkmode')" href="#check-mode" />
          <n-anchor-link :title="$t('home.nav.styling')" href="#styling" />
          <n-anchor-link :title="$t('home.nav.printing')" href="#printing" />
        </n-anchor-link>

        <n-anchor-link :title="$t('home.nav.howtouse')" href="#manual">
          <n-anchor-link :title="$t('home.nav.account')" href="#account" />
          <n-anchor-link :title="$t('home.nav.grideditor')" href="#grid-editor" />
          <n-anchor-link :title="$t('home.nav.resize')" href="#resize" />
          <n-anchor-link :title="$t('home.nav.customwords')" href="#customwords" />
          <n-anchor-link :title="$t('home.nav.suggestions')" href="#suggestions" />
          <n-anchor-link :title="$t('home.nav.heatmap')" href="#heatmap" />
        </n-anchor-link>

        <n-anchor-link :title="$t('home.nav.languages')" href="#languages">
          <n-anchor-link :title="$t('home.nav.langsupport')" href="#langsupport" />
          <n-anchor-link :title="$t('home.nav.langswitch')" href="#langswitch" />
        </n-anchor-link>
        <n-anchor-link :title="$t('home.nav.about')" href="#about">
          <n-anchor-link :title="$t('home.nav.why')" href="#why" />
          <n-anchor-link :title="$t('home.nav.who')" href="#who" />
          <n-anchor-link :title="$t('home.nav.contribute')" href="#contribute" />
          <n-anchor-link :title="$t('home.nav.support')" href="#support" />
        </n-anchor-link>
      </n-anchor>
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
import Layout from "../layouts/Main.vue";
import {
  CogOutline as CogIcon,
  LanguageOutline,
  Hammer,
  Flash,
} from "@vicons/ionicons5";
</script>

<style lang="scss">
h1 {
  font-size: 2em;
}

div.content {
  max-width: 100%;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 500px;
  text-align: justify;

}

div.content>article {
  width: 100%;
  box-sizing: border-box;
  max-width: 740px;
  padding: 0;
  margin: 30px 0;
}

.left-menu {
  margin-top: 20px;
}

a.n-anchor-link__title {
  font-size: 1.3em;
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

