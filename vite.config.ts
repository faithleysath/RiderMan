import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Unocss from "unocss/vite";
import viteVConsole from 'vite-plugin-vconsole';
import path from 'path';
import { DevTools } from '@guiiai/core';

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => ({
  plugins: [vue(), Unocss(), DevTools(), viteVConsole({
           entry: path.resolve('src/main.ts'),
           localEnabled: true,
           enabled: true,
           config: {
             maxLogNumber: 1000,
             // theme: 'dark'
           }
         })
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
