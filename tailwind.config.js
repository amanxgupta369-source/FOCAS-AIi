export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '380px',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        focas: {
          ice: '#dceaf5',
          sky: '#b5d1e8',
          steel: '#8baac8',
          heading: '#26364a',
          secondary: '#738398',
          primary: '#536f91',
          dark: '#1e293b',
        },
        dusk: {
          DEFAULT: '#536f91',
          deep: '#536f91',
          sky: '#b5d1e8',
          pale: '#dceaf5',
          surface: 'rgba(255, 255, 255, 0.22)',
          ice: '#dceaf5',
          ink: '#26364a',
          mute: '#738398',
        },
        sky: {
          focas: '#b5d1e8',
          dusty: '#8baac8',
          pale: '#dceaf5',
          surface: 'rgba(255, 255, 255, 0.22)',
          deep: '#536f91',
          ink: '#26364a',
        },
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(38, 54, 74, 0.04)',
        glass: '0 8px 32px 0 rgba(38, 54, 74, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4)',
        'glass-hover': '0 12px 36px 0 rgba(38, 54, 74, 0.12), inset 0 1px 2px 0 rgba(255, 255, 255, 0.5)',
        'glass-deep': '0 16px 40px -10px rgba(38, 54, 74, 0.3), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
      },
    },
  },
}
