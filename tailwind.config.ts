import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 宣纸 / 墨色
        paper: {
          DEFAULT: '#F5EFE1',
          soft: '#FBF7EE',
          deep: '#E8DFC9',
        },
        ink: {
          DEFAULT: '#1C1A17',
          soft: '#5A5248',
          faint: '#8C8375',
        },
        // 朱红
        vermilion: {
          DEFAULT: '#9E2B25',
          light: '#C1443C',
          soft: '#E3B0AC',
        },
        // 青黛
        dai: {
          DEFAULT: '#2E4A62',
          light: '#3E6B9E',
          soft: '#A8BCCC',
        },
        gold: '#C8A45C',
        jade: '#2F7D5B',
        clay: '#B4553F',
        night: {
          DEFAULT: '#12181F',
          soft: '#1A232C',
          line: '#2A3440',
        },
      },
      fontFamily: {
        sans: [
          '"Source Han Sans SC"',
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
        serif: [
          '"Source Han Serif SC"',
          '"Noto Serif SC"',
          '"Songti SC"',
          '"SimSun"',
          'serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,26,23,0.04), 0 8px 24px -12px rgba(28,26,23,0.12)',
        'card-hover': '0 2px 4px rgba(28,26,23,0.06), 0 16px 40px -16px rgba(158,43,37,0.22)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.4s ease both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
