import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react'
// The backend has no CORS middleware, so in dev we proxy /api -> backend (default port 3000).
export default defineConfig({ plugins: [react()], server: { proxy: { '/api': { target: process.env.BACKEND_URL || 'http://localhost:3000', rewrite: p => p.replace(/^\/api/, '') } } } })
