<template>
  <section class="section">
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
                <div id="export-grid" class="wrapper">
                  <ul class="grid" :style="getTemapleColumn()">
                    <li
                      v-for="(item, i) in flatCells"
                      :class="getClass(item.key)"
                      :key="i"
                    >
                      {{ item.value }}
                    </li>
                  </ul>
                </div>
              </section>
              <footer class="modal-card-foot">
                <b-button class="is-primary" @click="visible = false"
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
import gridMixin from '../js/gridMixin';

export default {
  name: 'Export',
  props: ['grid', 'rows', 'cols', 'isDefinition', 'cellValues'],
  components: {},
  mixins: [gridMixin],
  watch: {
    grid: {
      handler() {
        this.export();
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
      const { x, y } = this.coordToXY(coords);
      return `${this.isDefinition[y][x] ? 'definition' : ''}`;
    },
    getTemapleColumn() {
      return {
        gridTemplateColumns: new Array(this.cols)
          .fill(0)
          .map(() => '50px')
          .join(' '),
      };
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

<style>
.wrapper {
  display: inline-block;
}
.grid li {
  border: 1px solid black;
  list-style-type: none;
  text-align: center;
  text-transform: capitalize;
  font-size: 45px;
  min-height: 50px;
  max-height: 50px;
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
  font-size: 12px;
  text-transform: none;
}
</style>
