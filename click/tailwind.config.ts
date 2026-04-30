import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617", // Yammy Dark Mode
        neon: {
          cyan: "#06B6D4",
          pink: "#F472B6",
          yellow: "#FACC15",
        },
        card: "rgba(255, 255, 255, 0.05)",
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)',
        '3d': '5px 5px 10px rgba(0,0,0,0.5), -2px -2px 10px rgba(255,255,255,0.05)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
