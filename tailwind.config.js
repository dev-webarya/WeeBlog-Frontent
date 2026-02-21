/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                '2xl': '1280px',
            },
            padding: {
                DEFAULT: '1.5rem',
                sm: '2rem',
                lg: '3rem',
                xl: '4rem',
                '2xl': '4rem',
            },
        },
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                bg: {
                    primary: 'var(--bg-primary)',
                    secondary: 'var(--bg-secondary)',
                    tertiary: 'var(--bg-tertiary)',
                    card: 'var(--bg-card)',
                    input: 'var(--bg-input)',
                    hover: 'var(--bg-hover)',
                    active: 'var(--bg-active)',
                    overlay: 'var(--bg-overlay)',
                },
                border: {
                    primary: 'var(--border-primary)',
                    secondary: 'var(--border-secondary)',
                    focus: 'var(--border-focus)',
                },
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    tertiary: 'var(--text-tertiary)',
                    inverse: 'var(--text-inverse)',
                },
            },
        },
    },
    plugins: [],
}
