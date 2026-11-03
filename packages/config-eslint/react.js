import baseConfig from "./base.js";
import reactPlugin from "eslint-plugin-react";

export default [
  ...baseConfig,
  {
    plugins: {
      react: reactPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      // Vous pouvez désactiver les règles de version si besoin, ou en ajouter d'autres
      "react/react-in-jsx-scope": "off", // Inutile avec React 17+
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];