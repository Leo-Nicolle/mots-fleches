import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import rootConfig from "../eslint.config.mjs";

export default tseslint.config(
  ...rootConfig,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "vue/multi-word-component-names": "off",
      "vue/no-unused-components": "off",
      "vue/no-v-for-template-key-on-child": "off",
      "no-debugger": "off",
    },
  },
);
