/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]',
    'from-gray-700',
    'via-green-900',
    'to-black',
    'via-blue-900',
    'via-red-900',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
