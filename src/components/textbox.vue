<template>
  <div class = "textbox" @click="$emit('click')">
    <input v-if="!isDefinition" :class="getClass()" type="text" v-model="model" />
    <textarea v-else :class="getClass()" type="text" v-model="definition" />
    <button class="switch" @click="onClick()"  tabindex="-1">x</button>
  </div>
</template>

<script>
export default {
  name: 'textbox',
  props: {
    value: String,
    highlighted: Boolean,
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
      if (!this.isDefinition && this.model && this.model.length > 1) {
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
      const highlight = `${this.highlighted ? 'is-primary' : ''}`;
      return `input ${this.isDefinition ? 'is-info definition' : 'letter'} ${highlight}`;
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
}
.letter {
  font-size: 45px;
  max-width: 50px;
  min-width: 50px;
  min-height: 50px;
  max-height: 50px;
}
.definition {
  font-size: 12px;
  background-color: #167df0;
  color: white;
  overflow: hidden;
  text-transform: lowercase;
  max-width: 50px;
  min-width: 50px;
  min-height: 50px;
  max-height: 50px;
}

.switch {
  transform: translate(-8px, 40px);
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
