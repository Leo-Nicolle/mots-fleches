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
          <n-anchor-link
            title="How do I add custom words ?"
            href="#customwords"
          />
          <n-anchor-link title="How suggestions work ?" href="#suggestions" />
          <n-anchor-link title="What is the heatmap ?" href="#heatmap" />
        </n-anchor-link>

        <n-anchor-link title="Languages" href="#languages">
          <n-anchor-link title="Which languages ?" href="#langsupport" />
          <n-anchor-link title="How to change language ?" href="#langswitch" />
        </n-anchor-link>
        <n-anchor-link title="About" href="#about">
          <n-anchor-link title="Why MotsFlex ?" href="#why" />
          <n-anchor-link title="Who is behind it ?" href="#who" />
          <n-anchor-link title="How to contribute ?" href="#contribute" />
          <n-anchor-link title="Support MotsFlex" href="#support" />

        </n-anchor-link>
      </n-anchor>
    </template>
    <template #body>
      <div class="content" ref="content">
        <article>
          <section class="hero" id="top">
            <img src="/icon.svg" id="heroimage" />
            <h1>Welcome to MotsFlex!</h1>
            <p>MotsFlex is an open source tool to help you create and print Crosswords</p>
          </section>
          <section id="wcid">
            <h2>What can it do ?</h2>
            <p>
              MotsFlex is a Crosswords creation tool. It helps you filling up
              the grid with words, and then export it as a PDF file. It can even
              generate words index and solution pages for you.
            </p>
          </section>
          <section id="grid-filling">
            <h3>Grid filling up</h3>
            MotsFlex has a powefull suggestion engine, which helps you filling
            up the grid without efforts. Everytime you modify the grid, it tries
            to find the words that fit the best into the grid, and proposes them
            to you. You can add your own custom words to the generation engine.
            <video src="/filling-up-fast.mp4" controls />
          </section>
          <section id="definition-editing">
            <h3>Definitions editing</h3>
            <p>
              MotsFlex allows you to edit your definition, and place arrows for
              it
            </p>
            <video src="/editing-definition.mp4" controls />
          </section>
          <section id="check-mode">
            <h3>Check mode</h3>
            <p>
              Once you are in check mode, MotsFlex will look for errors in your
              grid: incomplete or unknown words, words without a definition,
              etc.
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
        </article>
        <article>
          <section id="manual">
            <h2>How to use it ?</h2>
            <p>
              In this section you will find all you need to understand how
              MotsFlex works and how to use it.
            </p>
          </section>
          <section id="account">
            <h3>Do I need an account ?</h3>
            <p>
              No, you don't need an account to use MotsFlex. You can just click
              on
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
                <kbd class="kbc-button">Esc</kbd>. Press again to turn it back
                to a normal cell.
              </li>
              <li>
                <b>Split a definition cell:</b> Jump a line, you will see a
                second button to set arrows. You wont see the split while you
                are focused on the definition cell.
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
              Resize can mean many things, here are all the answers to this
              topic.
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
                <b>Make the cells bigger/smaller:</b> In the Editor, you can
                zoom in/out with the
                <n-icon :size="'1.5em'"> + </n-icon>/<n-icon :size="'1.5em'">
                  -
                </n-icon>
                buttons in the bottom right of the screen.
              </li>
              <li>
                <b>Make the cells bigger/smaller when printing:</b> You will
                need to go to the Styles page, and change the
                <em>Cell size</em> property.
              </li>
            </ul>
          </section>
          <section id="customwords">
            <h3>How can I add custom words ?</h3>
            <p>
              Just got to the <em>Words</em> page, and add your words. You can
              also delete them from there. You cannot modify the base
              dictionnary though. 
              You might need to refresh the page to get thoose words in your suggestions.
            </p>
          </section>
          <section id="suggestions">
            <h3>How does suggestions work ?</h3>
            <p>
              There are two suggestions mode:
              <n-icon :size="'1.5em'">
                <Hammer />
              </n-icon>
              and
              <n-icon :size="'1.5em'"> <Flash /> </n-icon>. The first one will
              suggest you words that fit in the grid and try to don't block you
              in the next steps. In this mode, you can sort words by
              <em>score</em>: The first words in the list will be less likely to
              block you. The second mode just suggest you words that fit in the
              grid.
            </p>
          </section>
          <section id="heatmap">
            <h3>What is the heatmap ?</h3>
            <p>
              Everytime you change something in the grid, the heatmap is
              regenerated at the same time as the suggestions for Hammer mode.
              It can take a while when the grid is empty, because there are a
              lot of possibilities, but as you are filling up the grid it
              becomes super fast.<br />
              The heatmap is a representation of the number of words that can
              fit in each cell. The more blue the cell is, the more words can
              fit in it, the more red the cell is, the less words can fit in it.
              It is advisable to fill up first the most red cells.
            </p>
          </section>
          <section id="languages">
            <h3 id="langsupport">What languages are supported ?</h3>
            <p>
              For now MotsFlex only supports Français, Español and English. If
              you want to add a new language, please open an issue on
              <a href="https://github.com/Leo-Nicolle/mots-fleches/issues"
                >here</a
              >.
            </p>
            <h3 id="langswitch">How to switch to annother language ?</h3>
            <p>
              Just click on the
              <n-icon :size="'1.5em'">
                <LanguageOutline />
              </n-icon>
              icon on the top right of the screen and select the language you
              want.
            </p>
          </section>
        </article>
        <article>
          <section class="hero" id="about">
            <h1>About MotsFlex!</h1>
            <p>
              Mots flex is an Open Source project (MIT licence). You can find
              the code
              <a href="https://github.com/Leo-Nicolle/mots-fleches"> here</a>.
              
            </p>
          </section>
          <section id="why">
            <h2>Why MotsFlex ?</h2>
            It all started with a friend wanting to create crossword puzzles. When I saw her doing it 
            by hand, I started too look on internet for a tool to generate crosswords. I was surprised to see tat 
            there were only paying solutions, or small free tools that would create sparse crosswords or withoout 
            printing features etc. Well there were clearly a lack of tool in that field.
            So I started to create MotsFlex, as a suggestions engine at first. A few months later,
            I injured myself doing woodworking. I was stuck at home with a hand in a cast, and I needed
            to do something. During three weeks I added more features, and published it online. 
            Since, my hand is back to life, and I continue maintaining and making evolve MotsFlex. 
          </section>
          <section id="who">
            <h2>Who is behind MotsFlex ?</h2>
            <p>
              For now there is only me. But if you want to contribute, you are more than welcome !
            </p>
          </section>
          <section id="contribute">
            <h2>How to contribute ?</h2>
            <p>
              You can contribute in many ways:
              <ul>
                <li>
                  <b>Code:</b> You can find the code
                  <a href="https://github.com/Leo-Nicolle/mots-fleches">here</a>. Follow the instructions in the <em>README</em>
                  to install the project locally. Then you can open a pull request with your changes.
                </li>
                <li>
                  <b>Report a bug:</b> You can open an issue <a href="https://github.com/Leo-Nicolle/mots-fleches/issues">here</a>.
                </li>
                <li>
                  <b>Buy me a beer:</b> You can support me and MotsFlex by <a href="https://www.buymeacoffee.com/nicolleleo">buying me a beer</a>. I will drink to your health!
                </li>
              </ul>
            </p>
          </section>
          <section id="support">
            <h2>Support MotsFlex</h2>
            <p>
              MotsFlex is fre fow now, and the local mode will remain free, but the online accounts might
              end up to cost me money. I host the grids on <a href="https://supabase.com/"> Supabase</a>,
              for now MotsFlex is on the free tier, but if the number of users increase, I will have to pay
              for it. So if you want to support MotsFlex, you can: <a href="https://www.buymeacoffee.com/nicolleleo">Buy me a beer</a>. I will drink to your health!
            </p>
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
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 500px;
}
div.content > article {
  width: 100%;
  max-width: 740px;
  padding: 0 20px;
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

