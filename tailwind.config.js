/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#E4E4FF',
        primary: '#FB5EA8',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'bebas': ['Bebas Neue', 'sans-serif'],
        'lilita': ['Lilita One', 'sans-serif'],
        'fredoka': ['Fredoka', 'sans-serif'],
        'league': ['League Spartan', 'sans-serif'],
        'anton': ['Anton', 'sans-serif'],
        'outfit': ['Outfit', 'sans-serif'],
        'sora': ['Sora', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
      },
      borderRadius: {
        'card': '24px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
