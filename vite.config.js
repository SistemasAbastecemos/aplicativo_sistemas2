import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteImagemin from "vite-plugin-imagemin";

export default defineConfig({
  plugins: [
    react(), // Plugin oficial de React para Vite
    viteImagemin({ // Plugin para optimización de imágenes
      gifsicle: { optimizationLevel: 7, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 }, // Calidad JPEG al 80%
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: "removeViewBox" },
          { name: "removeEmptyAttrs", active: false }
        ]
      }
    }),
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  },
  build: {
    outDir: 'dist', // Carpeta de salida para el build
    assetsDir: 'assets', // Subcarpeta para assets
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'], // Separa dependencias en chunk aparte
        },
      },
    },
  },
  server: {
    port: 3000, // Puerto de desarrollo
    open: true, // Abre automáticamente el navegador
    host: true // Permite acceso desde dispositivos en la red local
  },
  resolve: {
    alias: { // Atajos para importaciones
      '@': '/src',
      '@components': '/src/components'
    }
  }
})