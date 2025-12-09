import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const hassUrl = env.VITE_HASS_URL || 'http://192.168.1.15:8123'

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            // Proxy requests to Home Assistant to avoid CORS issues in development
            proxy: {
                '/api/hass': {
                    target: hassUrl,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/hass/, '/api'),
                    secure: false,
                    configure: (proxy) => {
                        proxy.on('error', (err, req, res) => {
                            console.error(`[Vite Proxy] Error connecting to Home Assistant at ${hassUrl}:`, err.message);
                            // Return a proper JSON error instead of letting Vite serve HTML
                            if (res && !res.headersSent) {
                                res.writeHead(503, {
                                    'Content-Type': 'application/json',
                                });
                                res.end(JSON.stringify({
                                    error: 'Home Assistant unreachable',
                                    message: `Cannot connect to Home Assistant at ${hassUrl}. Please ensure Home Assistant is running and the URL is correct.`,
                                    target: hassUrl,
                                }));
                            }
                        });
                        proxy.on('proxyReq', (proxyReq, req) => {
                            console.log(`[Vite Proxy] ${req.method} ${req.url} -> ${hassUrl}${proxyReq.path}`);
                        });
                    },
                },
            },
        },
    }
})
