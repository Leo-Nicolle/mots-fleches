<template>
  <Layout>
    <template #left-panel>
      <n-anchor
        class="left-menu"
        :show-rail="false"
        :show-background="true"
        :affix="false"
      >
        <n-anchor-link title="Welcome" href="#top" />
        <n-anchor-link title="What can it do ? " href="#wcid">
          <n-anchor-link title="Grid filling up" href="#grid-filling" />
          <n-anchor-link
            title="Definition editing"
            href="#definition-editing"
          />
          <n-anchor-link title="Check mode" href="#check-mode" />
          <n-anchor-link title="Styling" href="#styling" />
          <n-anchor-link title="Printing" href="#printing" />
        </n-anchor-link>

        <n-anchor-link title="How to use it ? " href="#manual">
          <n-anchor-link title="Do I need an account ?" href="#account" />
          <n-anchor-link title="How to use the Editor ?" href="#grid-editor" />
          <n-anchor-link title="How do I resize my grid ?" href="#resize" />
        </n-anchor-link>
        <n-anchor-link
          title="Languages"
          href="#languages"
        >
        </n-anchor-link>
      </n-anchor>
    </template>
    <template #body>
      <article class="main">
        <section class="hero" id="top">
          <img src="/icon.svg" id="heroimage" />
          <h1>Welcome to MotsFlex!</h1>
          <p>MotsFlex is an open source tool to help you create Crosswords</p>
        </section>
        <section id="wcid">
          <h2>What can it do ?</h2>
          <p>
            MotsFlex is a Crosswords creation tool. It helps you filling up the
            grid with words, and then export it as a PDF file. It can even
            generate words index and solution pages for you.
          </p>
        </section>
        <section id="grid-filling">
          <h3>Grid filling up</h3>
          MotsFlex has a powefull suggestion engine, which helps you filling up
          the grid without efforts. Everytime you modify the grid, it tries to
          find the words that fit the best into the grid, and proposes them to
          you. You can add your own custom words to the generation engine.
          <video src="/filling-up-fast.mp4" controls />
        </section>
        <section id="definition-editing">
          <h3>Definitions editing</h3>
          <p>
            MotsFlex allows you to edit your definition, and place arrows for it
          </p>
          <video src="/editing-definition.mp4" controls />
        </section>
        <section id="check-mode">
          <h3>Check mode</h3>
          <p>
            Once you are in check mode, MotsFlex will look for errors in your
            grid: incomplete or unknown words, words without a definition, etc.
          </p>
          <video src="/check-mode.mp4" controls />
        </section>
        <section id="styling">
          <h3>Styling</h3>
          <p>
            You can customize the style of your crossword, by changing the
            colors, fonts, line width etc. Pretty much everything !
          </p>
          <video src="/styling.mp4" controls />
        </section>
        <section id="printing">
          <h3>Printing</h3>
          <p>
            MotsFlex allows you to print your grids as SVG or PDF. It also
            generates a solution page for you, with the grids and the words
            index. You can define styles for the solution page, change the
            layout of the grids, change the font of the words index, etc.
          </p>
          <video src="/printing.mp4" controls />
        </section>

        <section class="hero" id="manual">
          <h2>How to use it ?</h2>
          <p>
            In this section you will find all you need to understand how
            MotsFlex works and how to use it.
          </p>
        </section>
        <section id="account">
          <h3>Do I need an account ?</h3>
          <p>
            No, you don't need an account to use MotsFlex. You can just click on
            <em>continue without account</em> and start using it. The only
            difference when you create an account is that your grids get saved
            on the server, so you can access them from any device.
          </p>
        </section>
        <section id="grid-editor">
          <h3>How to use the Editor ? What are the shortcuts ?</h3>
          <p>
            The editor is the main part of MotsFlex. It has many features and
            shortcuts, which are listed below.
          </p>
          <ul>
            <li>
              <b>Turn a cell into definition:</b> Press
              <kbd class="kbc-button">Esc</kbd>. Press again to turn it back to
              a normal cell.
            </li>
            <li>
              <b>Split a definition cell:</b> Jump a line, you will see a second
              button to set arrows. You wont see the split while you are focused
              on the definition cell.
            </li>
            <li>
              <b>Move around in the grid:</b> Press
              <kbd class="kbc-button">&uarr;</kbd>
              <kbd class="kbc-button">&larr;</kbd>
              <kbd class="kbc-button">&rarr;</kbd>
              <kbd class="kbc-button">&darr;</kbd>
              When you are in a definition cell, you can also press
              <kbd class="kbc-button">Ctrl</kbd> +<kbd class="kbc-button"
                >Enter</kbd
              >
              to move to the next definition cell.
            </li>
            <li>
              <b>Add a space in a word:</b> Press
              <kbd class="kbc-button">|</kbd> for vertical space, or
              <kbd class="kbc-button">_</kbd> for horizontal space.
            </li>
            <li>
              <b>Switch between suggestion modes:</b> Press
              <kbd class="kbc-button">Space</kbd>.
            </li>
            <li>
              <b>Switch between ordering modes:</b> Press
              <kbd class="kbc-button">&gt;</kbd> or
              <kbd class="kbc-button">&lt;</kbd> .
            </li>
          </ul>
        </section>
        <section id="resize">
          <h3>How do I resize my grid ?</h3>
          <p>
            Resize can mean many things, here are all the answers to this topic.
          </p>
          <ul>
            <li>
              <b>Add/Remove lines and columns:</b> When you are in the editor,
              click on
              <n-icon :size="'1.5em'">
                <CogIcon />
              </n-icon>
              in the left panel.
            </li>
            <li>
              <b>Make the cells bigger/smaller:</b> In the Editor, you can zoom
              in/out with the <n-icon :size="'1.5em'"> + </n-icon>/<n-icon
                :size="'1.5em'"
              >
                -
              </n-icon>
              buttons in the bottom right of the screen.
            </li>
            <li>
              <b>Make the cells bigger/smaller when printing:</b> You will need
              to go to the Styles page, and change the
              <em>Cell size</em> property.
            </li>
          </ul>
        </section>
        <section id="languages">
          <h3>What languages are supported ?</h3>
          <p>
            For now MotsFlex only supports Français, Español and English. If you
            want to add a new language, please open an issue on
            <a href="https://github.com/Leo-Nicolle/mots-fleches/issues">here</a
            >.
          </p>
        </section>
      </article>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "../layouts/Main.vue";
import { CogOutline as CogIcon } from "@vicons/ionicons5";
</script>

<style lang="scss">
article.main {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 740px;
  margin-bottom: 50px;
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
  margin-bottom: 30px;
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

