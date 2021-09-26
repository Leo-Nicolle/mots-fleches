<template>
    <div class="suggestions">
      <span>
        <b-field>
            <b-button class="is-primary" :icon-right="getIcon()" @click="$emit('switchordering')" />
        </b-field>
        <b-field>
            <b-button class="is-primary" @click="$emit('switchdirection')">{{direction}}</b-button>
        </b-field>
      </span>
        <div v-if="loading" class="loading">
          <svg class="spinner" viewBox="0 0 50 50">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
          </svg>
        </div>
        <b-table v-else :data="suggestions" :columns="columns" :paginated="true" :per-page="10" :pagination-simple="true" :selected.sync="selected" hoverable clickable />
        <p>
          Resultats: <b>{{resultLength}}</b>
        </p>
    </div>
</template>

<script>
export default {
  name: 'Suggestions',
  data() {
    return {
      selected: null,
      columns: [{
        field: 'word',
        label: 'Suggestions',
        width: '40',
      }],
    };
  },
  props: ['suggestions', 'direction', 'loading', 'resultLength', 'ordering'],
  watch: {
    selected(newValue) {
      this.$emit('wordhover', newValue.word);
    },
  },
  methods: {
    getIcon() {
      return this.ordering === 'ASC' ? 'arrow-up' : 'arrow-down';
    },
  },
};
</script>

<style>
.suggestions {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-left: 30px;

    max-width: 344px;
    min-width: 344px;
}
.suggestions > span{
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.loading{
  height: 470px;
  background: #ddd;
  border-radius: 5px;
}
.spinner {
  width: 50%;
  margin-top: 50%;
  margin-left: 25%;
  animation: rotate 2s linear infinite;
  z-index: 2;
}
.spinner .path {
  stroke: #93bfec;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}
 @keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}
 @keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

table td:hover {
    cursor: pointer;
}

table td:hover {
    font-size: 20px;
}
</style>
