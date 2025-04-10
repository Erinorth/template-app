import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import path from 'path';
import tailwindcss from "@tailwindcss/vite";
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.ts'],
            ssr: 'resources/js/ssr.ts',
            refresh: true,
        }),
        tailwindcss(),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
    base: '/template-app/build/', // Base URL สำหรับ production
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    server: {
        cors: {
            origin: ['http://127.0.0.1:8000', 'http://10.40.67.84'], // ระบุแหล่งที่มาที่อนุญาต
        },
    },
    build: {
        outDir: 'public/build', // โฟลเดอร์สำหรับไฟล์ที่ build
        assetsDir: 'assets', // โฟลเดอร์สำหรับ assets ภายใน outDir
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor'; // แยก vendor chunk ออก
                    }
                },
            },
        },
    },
});
