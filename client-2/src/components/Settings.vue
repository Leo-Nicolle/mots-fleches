<template>
  <span>
    <b-button class="is-primary" @click="visible = true">Parametres</b-button>

    <b-modal
      v-model="visible"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-label="Parametres"
      aria-modal
    >
      <template>
        <form action="">
          <div class="modal-card" style="width: auto">
            <header class="modal-card-head">
              <p class="modal-card-title">Parametres</p>
              <button type="button" class="delete" @click="visible = false" />
            </header>
            <section class="modal-card-body">
              <b-field>
                Colonnes
                <b-numberinput
                  v-model="cols"
                  @input="$emit('change', { rows, cols, name })"
                ></b-numberinput>
              </b-field>
              <b-field>
                Lignes
                <b-numberinput
                  v-model="rows"
                  @input="$emit('change', { rows, cols, name })"
                ></b-numberinput>
              </b-field>
              <b-field>
                nom
                <b-input
                  v-model="name"
                  @input="$emit('change', { rows, cols, name })"
                ></b-input>
              </b-field>
            </section>
            <footer class="modal-card-foot">
              <b-button class="is-primary" @click="visible=false">Ok</b-button>
              <b-button class="is-danger" @click="onDelete">supprimer la grille</b-button>

            </footer>
          </div>
        </form>
      </template>
    </b-modal>
  </span>
</template>

<script>
export default {
  name: 'Settings',
  props: ['rowP', 'colP', 'nameP'],
  watch: {
    rowP: {
      immediate: true,
      handler(newValue) { this.rows = newValue; },
    },
    colP: {
      immediate: true,
      handler(newValue) { this.cols = newValue; },
    },
    nameP: {
      immediate: true,
      handler(newValue) { this.name = newValue; },
    },
    visible(newValue, oldValue) {
      if (newValue || this.deleting) return;
      this.$emit('close');
    },
  },
  methods: {
    onDelete() {
      this.$emit('delete');
      this.deleting = true;
      this.visible = false;
      setTimeout(() => {
        this.deleting = false;
      }, 200);
    },
  },

  data() {
    return {
      rows: 10,
      cols: 10,
      name: '',
      deleting: false,
      visible: false,
    };
  },
};
</script>

<style scoped>
</style>
