import type { Config } from "tailwindcss";

const sharedConfig: Omit<Config, "content"> = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
      
        brand: {
          50: "#f0fdf4",
          500: "#22c55e",
          900: "#14532d",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default sharedConfig;