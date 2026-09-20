import preset, { content as frappeUIContent } from 'frappe-ui/tailwind'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    ...frappeUIContent,
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
}
