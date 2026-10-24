export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    colors: { dusk: { DEFAULT: '#7898BB', deep: '#536F91', sky: '#A9CDE8', pale: '#DCEAF5', ice: '#EDF5FA', ink: '#26364A', mute: '#738398' } },
  } },
}
