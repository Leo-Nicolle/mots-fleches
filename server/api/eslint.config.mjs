import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      // parser: "@typescript-eslint/parser",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "off",
    },
    ignores: ["node_modules", "dist", "esbuild.config.js"],
  },
);

// export default [
//   js.configs.recommended,
//   // typescript,
//   // prettier,
//   {
//     languageOptions: {
//       ecmaVersion: 2022,
//       sourceType: "module",
//       // parser: "@typescript-eslint/parser",
//       globals: {
//         // ...globals.node,
//       },
//     },
//     // parser: "@typescript-eslint/parser",
//     plugins: ["@typescript-eslint"],
//     rules: {
//       "no-console": "off",
//     },
//   },
// ];
