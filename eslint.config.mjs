import nextPlugin from "eslint-config-next";
import nextTs from "eslint-config-next/typescript";

export default [
  ...nextPlugin,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
