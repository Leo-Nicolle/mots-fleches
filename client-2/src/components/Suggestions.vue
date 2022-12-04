<template>
  <div class="suggestions">
    <span>
      <b-field>
        <b-button
          class="is-primary"
          @click="$emit('switchordering')"
        >
        <i :class="getIcon()"></i>
        </b-button>
      </b-field>
      <b-field>
        <b-button
          class="is-primary"
          @click="$emit('switchmethod')"
        >
            <i :class="getIconMethod()"></i>
        </b-button>
      </b-field>
      <b-field>
        <b-button class="is-primary" @click="$emit('switchdirection')">{{
          direction
        }}</b-button>
      </b-field>
    </span>
    <div v-if="loading || getError()" class="loading">

      <svg v-if="loading" class="spinner" viewBox="0 0 50 50">
        <circle
          class="path"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="5"
        ></circle>
      </svg>
      <div v-else class="error is-size-1 has-text-danger">
        Erreur
      </div>
    </div>
    <b-table
      v-else
      :data="suggestions"
      :paginated="true"
      :per-page="10"
      :pagination-simple="true"
      :selected="selected"
      hoverable
      clickable
    >
      <b-table-column label="Suggestions" v-slot="props">
        <span>
          <span>{{ props.row.word }}</span>
          <a
            @click="onHelpClick"
            class="helplink"
            :href="props.row.link"
            target="_blank"
          >
            ?
          </a>
        </span>
      </b-table-column>
    </b-table>
    <p>
      Resultats: <b>{{ resultLength }}</b>
    </p>
  </div>
</template>

<script>
export default {
  name: 'Suggestions',
  data() {
    return {
      selected: null,
      columns: [
        {
          field: 'word',
          label: 'Suggestions',
          width: '40',
        },
      ],
    };
  },
  props: [
    'suggestions',
    'statusSearch',
    'direction',
    'loading',
    'resultLength',
    'ordering',
    'method',
  ],
  watch: {
    selected(newValue) {
      this.$emit('wordhover', newValue.word);
    },
  },
  methods: {
    getError() {
      return this.statusSearch === 'ok'
        ? null
        : 'error';
    },
    getIcon() {
      return `icon icon-arrow ${this.ordering === 'ASC' ? 'up' : 'down'}`;
    },
    getIconMethod() {
      return `icon icon-${this.method === 'fastest' ? 'elephant' : 'dog translated'}`;
    },
    onHelpClick(evt) {
      evt.stopPropagation();
    },
  },
};
</script>

<style>
i::before{
  font-size: 2.5em;
}
i.translated::before{
  transform: translate(-50%, 0);
}
.suggestions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-left: 30px;

  max-width: 344px;
  min-width: 344px;
}
.suggestions > span {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.loading {
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
.helplink:hover {
  cursor: help;
  border: 1px solid black;
  border-radius: 20px;
  min-width: 25px;
  min-height: 25px;
  max-width: 25px;
  max-height: 25px;
  text-align: center;
}
td > span{
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.error{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  align-content: center;
}
</style>
