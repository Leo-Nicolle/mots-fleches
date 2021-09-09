<template>
  <div class = "textbox" @click="$emit('click')">

    <input v-if="!isDefinition" :class="getClass()" type="text" v-model="model" @keypress="$emit('keypress')"/>
    <textarea v-else :class="getClass()" type="text" v-model="definition" @keypress="$emit('keypress')"/>
    <button class="switch" @click="onClick()">x</button>
  </div>
</template>

<script>
export default {
  name: 'textbox',
  props: {
    value: String,
  },
  data() {
    return {
      model: '',
      definition: '',
      isDefinition: false,
    };
  },
  watch: {
    value() {
      this.model = this.value;
    },
    model() {
      if (!this.isDefinition && this.model.length > 1) {
        this.model = this.model.slice(this.model.length - 1);
      }
      if (!this.isDefinition) {
        this.$emit('input', this.model);
      }
    },
  },
  // computed: {
  //   model: {
  //     get() { return this.value; },
  //     set(v) {
  //       this.$emit('input', v);
  //       this.value = v;
  //     },
  //   },
  // },
  methods: {
    getClass() {
      return `input ${this.isDefinition ? 'definition' : 'letter'}`;
    },
    onClick() {
      this.isDefinition = !this.isDefinition;
      if (this.isDefinition) {
        this.model = String.fromCharCode(10);
        this.$emit('input', String.fromCharCode(10));
      } else {
        this.model = '';
        this.$emit('input', '');
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>
.textbox{
  display: flex;
}
.input {
  min-width: 46px;
  max-width: 46px;
  padding: 0;
  min-height: 52px;
  text-align: center;
  text-overflow: clip;
  text-transform: uppercase;
  border: 1px solid;
}
.letter {
  font-size: 45px;
}
.definition {
  font-size: 12px;
  background-color: #9dede8;
  text-transform: lowercase;
}

.switch {
  transform: translate(-8px, 45px);
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background-color: #999;
  max-width: 15px;
  max-height: 15px;
  min-width: 15px;
  margin: 0;
  position: relative;
}

.switch:hover {
  background-color: #eee;
}
</style>
