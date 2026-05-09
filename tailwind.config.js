export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#e8edf3',
          dim: '#8a93a3',
          sub: '#5b6373',
        },
        canvas: {
          DEFAULT: '#0a0d12',
          elevated: '#0e1218',
        },
      },
      animation: {
        'spin-slow': 'spin 26s linear infinite',
        'core-pulse': 'corePulse 2.4s ease-in-out infinite',
        'ring-pulse': 'ringPulse 3.6s ease-out infinite',
        'aura-pulse': 'auraPulse 1.4s ease-out infinite',
        'live-blink': 'liveBlink 1.5s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s cubic-bezier(.2,.7,.3,1)',
        'scan-line': 'scanLine 2.6s ease-in-out infinite',
        'logo-spin': 'logoSpin 14s linear infinite',
        'logo-pulse': 'logoPulse 2.4s ease-in-out infinite',
      },
      keyframes: {
        logoSpin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        logoPulse: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.08)' },
        },
        corePulse: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(0.92)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        ringPulse: {
          '0%': { transform: 'translate(-50%, -50%) scale(0.4)', opacity: '0' },
          '20%': { opacity: '0.6' },
          '100%': { transform: 'translate(-50%, -50%) scale(1.6)', opacity: '0' },
        },
        auraPulse: {
          '0%': { transform: 'scale(0.6)', opacity: '0.9' },
          '80%, 100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        liveBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
        scanLine: {
          '0%': { transform: 'translate(-50%, -110px) scaleX(0.4)', opacity: '0' },
          '10%': { opacity: '1' },
          '50%': { transform: 'translate(-50%, 0) scaleX(1)' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translate(-50%, 110px) scaleX(0.4)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}