<template>
  <div class = "textbox" @click="$emit('click')">
    <input v-if="!isDefinition" :class="getClass()" type="text" v-model="model" @keyup="onKeyPress"/>
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
    isDefinition: Boolean,
  },
  data() {
    return {
      model: '',
      definition: '',
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (this.isDefinition) {
          this.definition = newVal;
        } else {
          this.model = newVal;
        }
      },
    },
    model(newValue, oldValue) {
      if (this.definition) return;
      if (!newValue.localeCompare(' ')) {
        this.model = '';
        return;
      }
      if (this.model && this.model.length > 1) {
        this.model = this.model.slice(this.model.length - 1);
      }
      if (this.model.length && oldValue.localeCompare(this.model)
       || !newValue.length && oldValue.length) {
        this.$emit('type', this.model);
      }
    },
  },
  methods: {
    getClass() {
      const highlight = `${this.highlighted ? 'is-primary' : ''}`;
      return `input ${this.isDefinition ? 'definition' : 'letter'} ${highlight}`;
    },
    onClick() {
      const isDefinition = !this.isDefinition;
      if (isDefinition) {
        this.model = '';
        this.$emit('switch', isDefinition);
      } else {
        this.model = '';
        this.$emit('switch', isDefinition);
      }
    },
    onKeyPress(evt) {
      if (!this.isDefinition) return;
      evt.stopPropagation();
    },
  },
};
</script>

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
