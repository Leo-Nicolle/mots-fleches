<template>
    <section class="section">
        <b-button class="is-primary" @click="visible=true">Parametres</b-button>

        <b-modal v-model="visible" has-modal-card trap-focus :destroy-on-hide="false" aria-role="dialog" aria-label="Parametres" aria-modal>
            <template>
                  <form action="">
                    <div class="modal-card" style="width: auto">
                        <header class="modal-card-head">
                            <p class="modal-card-title">Parametres</p>
                            <button
                                type="button"
                                class="delete"
                                @click="visible=false"/>
                        </header>
                        <section class="modal-card-body">
                    <b-field>
                    Colonnes
                    <b-numberinput v-model="cols" @input="$emit('change', {rows,cols})"></b-numberinput>
                  </b-field>
                  <b-field>
                    Lignes
                    <b-numberinput v-model="rows" @input="$emit('change', {rows,cols})"></b-numberinput>
                  </b-field>
                        </section>
                        <footer class="modal-card-foot">
                        </footer>
                    </div>
                </form>
            </template>
        </b-modal>
    </section>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      rows: 10,
      cols: 10,
      visible: false,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>

</style>
