import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            // Proxy requests to Home Assistant to avoid CORS issues in development
            proxy: env.VITE_HASS_URL ? {
                '/api/hass': {
                    target: env.VITE_HASS_URL,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/hass/, '/api'),
                    secure: false,
                },
            } : undefined,
        },
    }
})
