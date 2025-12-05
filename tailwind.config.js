/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#FDFCF8',
                primary: {
                    DEFAULT: '#E0A82E', // Muted Marigold
                    hover: '#C79324',
                },
                secondary: {
                    DEFAULT: '#144256', // Deep Peacock Teal
                    hover: '#0E3342',
                },
                text: {
                    DEFAULT: '#1A1A1A', // Dark Charcoal
                    muted: '#4A4A4A',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'antigravity': '0 20px 50px rgba(0,0,0,0.05)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
}
