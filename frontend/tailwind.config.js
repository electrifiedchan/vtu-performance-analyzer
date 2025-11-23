/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        'electric-blue': '#00f3ff',
        'electric-blue-dim': 'rgba(0, 243, 255, 0.1)',
      },
      animation: {
        'spotlight': 'spotlight 2s ease .75s 1 forwards',
        'float-orb': 'float-orb 20s ease-in-out infinite',
        'float-grade': 'float-grade 15s ease-in-out infinite',
      },
      keyframes: {
        spotlight: {
          '0%': {
            opacity: 0,
            transform: 'translate(-72%, -62%) scale(0.5)',
          },
          '100%': {
            opacity: 1,
            transform: 'translate(-50%,-40%) scale(1)',
          },
        },
        'float-orb': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 30px) scale(0.9)',
          },
        },
        'float-grade': {
          '0%, 100%': {
            transform: 'translateY(0) rotate(0deg)',
            opacity: 0.05,
          },
          '50%': {
            transform: 'translateY(-20px) rotate(5deg)',
            opacity: 0.1,
          },
        },
      },
    },
  },
  plugins: [],
}
