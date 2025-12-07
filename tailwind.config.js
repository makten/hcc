/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dark Mode Luxury palette
                background: {
                    DEFAULT: '#121212',
                    lighter: '#1e1e1e',
                    card: 'rgba(30, 30, 30, 0.6)',
                },
                accent: {
                    primary: '#00d4ff', // Neon cyan
                    secondary: '#ff6b35', // Neon orange
                    success: '#00ff88', // Neon green
                    warning: '#ffcc00', // Neon yellow
                    purple: '#a855f7', // Neon purple
                },
                glass: {
                    DEFAULT: 'rgba(255, 255, 255, 0.05)',
                    border: 'rgba(255, 255, 255, 0.1)',
                    hover: 'rgba(255, 255, 255, 0.08)',
                },
            },
            backdropBlur: {
                glass: '20px',
            },
            boxShadow: {
                glow: '0 0 20px rgba(0, 212, 255, 0.3)',
                'glow-warm': '0 0 20px rgba(255, 204, 0, 0.4)',
                'glow-success': '0 0 20px rgba(0, 255, 136, 0.3)',
                'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'equalizer': 'equalizer 0.5s ease-in-out infinite alternate',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                equalizer: {
                    '0%': { height: '4px' },
                    '100%': { height: '16px' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
}
