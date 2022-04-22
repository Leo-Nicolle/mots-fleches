export default {
  methods: {
    getUrl(param) {
      return `http://localhost:${process.env.VUE_APP_APIPORT}/${param}`;
    },
  },
};
