import catppuccin from '@catppuccin/daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./components/**/*.vue", "./pages/**/*.vue"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
        catppuccin('mocha', { primary: 'sky', secondary: 'rosewater'}),
    ],
  },
  plugins: [require("daisyui")],
}

