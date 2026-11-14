import globals from "globals";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";

export default [
  // the frontend has its own eslint config and dependencies
  { ignores: ["frontend/**", "data/**"] },
  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2025,
      },
    },
    plugins: {
      prettier: prettier,
    },

    rules: {
      ...js.configs.recommended.rules,
      "no-console": 0,

      // Prettier integration - this runs Prettier through ESLint
      "prettier/prettier": [
        "error",
        {
          endOfLine: "lf",
          trailingComma: "es5",
          singleQuote: false,
        },
      ],
    },
  },
  eslintConfigPrettier,
];
