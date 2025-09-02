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
    // Player colors for borders, text, and shadows
    ...['cyan', 'rose', 'lime', 'violet', 'amber', 'indigo', 'emerald', 'fuchsia', 'sky', 'pink', 'teal', 'yellow'].flatMap(color => [
      `text-${color}-400`,
      `border-${color}-400`,
      `shadow-[0_0_15px_rgba(var(--tw-color-${color}-500-rgb),0.6)]`,
    ]),
    // Accent colors for dynamic UI elements like progress bars
    ...['cyan', 'lime', 'sky', 'amber', 'rose'].flatMap(color => [
      `bg-${color}-500`,
      `bg-${color}-500/20`
    ]),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}