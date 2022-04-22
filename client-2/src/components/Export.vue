<template>
  <section class="section">
    <div v-if="visible" id="export-grid" class="wrapper">
      <ul class="grid" :style="getTemapleColumn()">
        <li v-for="(item, i) in flatCells" :class="getClass(item.key)" :key="i">
          {{ item.value }}
        </li>
      </ul>
    </div>
    <span>
      <b-button class="is-primary" @click="visible = true">export</b-button>
      <b-modal
        v-model="visible"
        has-modal-card
        trap-focus
        :destroy-on-hide="false"
        aria-role="dialog"
        aria-label="export"
        aria-modal
      >
        <template>
          <form action="">
            <div class="modal-card" style="width: auto">
              <header class="modal-card-head">
                <p class="modal-card-title">Export</p>
                <button type="button" class="delete" @click="visible = false" />
              </header>
              <section class="modal-card-body">
                <img :src="dataUrl" />
              </section>
              <footer class="modal-card-foot">
                <b-button class="is-primary" @click="onClick"
                  >export</b-button
                >
              </footer>
            </div>
          </form>
        </template>
      </b-modal>
    </span>
  </section>
</template>

<script>
import domtoimage from 'dom-to-image';

export default {
  name: 'Export',
  props: ['grid', 'rows', 'cols', 'isDefinition', 'cellValues', 'name'],
  components: {},
  watch: {
    visible: {
      handler() {
        this.$nextTick()
          .then(() => {
            this.export();
          });
      },
    },
  },
  computed: {
    flatCells() {
      return this.grid
        ? Object.entries(this.grid).map(([key, value]) => ({ key, ...value }))
        : [];
    },
  },
  methods: {
    getClass(coords) {
      const [y, x] = coords.match(/(\d+),(\d+)/).slice(1).map((n) => +n);
      return `${this.isDefinition[y][x] ? 'definition' : ''}`;
    },
    getTemapleColumn() {
      return {
        gridTemplateColumns: new Array(this.cols)
          .fill(0)
          .map(() => '200px')
          .join(' '),
      };
    },
    onClick() {
      fetch(this.dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${this.name}.png`); // or any other extension
          // document.body.appendChild(link);
          link.click();
          this.visible = false;
        });
    },
    export() {
      domtoimage
        .toPng(document.getElementById('export-grid'))
        .then((dataUrl) => {
          this.dataUrl = dataUrl;
        });
    },
  },

  data() {
    return {
      dataUrl: '',
      visible: false,
    };
  },
};
</script>

<style scoped>
.wrapper {
  display: inline-block;
}
.grid li {
  border: 1px solid black;
  list-style-type: none;
  text-align: center;
  text-transform: capitalize;
  font-size: 180px;
  min-height: 200px;
  max-height: 200px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  word-break: break-all;
}
.grid {
  width: 100%;
  display: grid;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Montserrat", sans-serif;
}
.grid li.definition {
  font-size: 50px;
  text-transform: none;
}
</style>
