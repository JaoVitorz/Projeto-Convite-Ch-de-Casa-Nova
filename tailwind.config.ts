import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6F0",
        ink: "#3A3832",
        olive: "#657154",
        blush: "#E9BDB8",
        rose: "#BE8179",
      },
      fontFamily: { serif: ["Georgia", "serif"] },
    },
  },
  plugins: [],
} satisfies Config;
