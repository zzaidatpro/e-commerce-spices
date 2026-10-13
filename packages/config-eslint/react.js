import baseConfig from "./base.js";
import reactPlugin from "eslint-plugin-react";

export default [
  ...baseConfig,
  reactPlugin.configs.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      
    },
  },
];