import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  define: { global: 'globalThis' },
  assetsInclude: ['**/*.glb','**/*.GLB','**/*.gltf','**/*.GLTF','**/*.hdr','**/*.HDR','**/*.png','**/*.PNG','**/*.jpg','**/*.JPG','**/*.jpeg','**/*.JPEG','**/*.gif','**/*.GIF','**/*.svg','**/*.SVG','**/*.webp','**/*.WEBP','**/*.mp4','**/*.MP4','**/*.mp3','**/*.MP3','**/*.pdf','**/*.PDF','**/*.obj','**/*.OBJ','**/*.bin','**/*.BIN'],
  server: {
    port: 5180,
    host: true,
    strictPort: true,
    proxy: { '/api': { target: 'http://localhost:1117', changeOrigin: true } },
  },
  optimizeDeps: {
    exclude: ['@ricky0123/vad-web'],
    esbuildOptions: { define: { global: 'globalThis' } }
  }
});
