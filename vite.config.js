import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [vue()],
    build: {
        outDir: 'resources/dist',
        emptyOutDir: true,
        cssCodeSplit: false,
        rollupOptions: {
            input: path.resolve(__dirname, 'resources/js/app.js'),
            output: {
                format: 'iife',
                name: 'RiwaaqChatApp',
                inlineDynamicImports: true,
                entryFileNames: 'app.js',
                assetFileNames: (asset) =>
                    asset.name && asset.name.endsWith('.css') ? 'app.css' : 'assets/[name][extname]',
            },
        },
    },
});
