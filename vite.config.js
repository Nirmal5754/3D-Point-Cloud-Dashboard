import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            '/point-cloud': {
                target: 'https://edu.3dbharat.com',
                changeOrigin: true,
                secure: true,
                rewrite: function (path) { return path.replace(/^\/point-cloud/, ''); },
            },
        },
    },
});
