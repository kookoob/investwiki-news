/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // 'class' 모드로 다크모드 활성화
  safelist: [
    // 다크모드 클래스 강제 포함 (Vercel 빌드 캐시 이슈 방지)
    {
      pattern: /dark:(bg|text|border)-(gray|blue|red|green|yellow|white|black)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    'dark:prose-invert',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
