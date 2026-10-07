import { resolve } from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-round3-assets',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/assets/')) {
            const cleanUrl = req.url.split('?')[0]
            const filePath = resolve(__dirname, 'round3/public' + cleanUrl)
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = cleanUrl.split('.').pop()?.toLowerCase()
              const mimeTypes = {
                png: 'image/png',
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                svg: 'image/svg+xml',
                webp: 'image/webp',
                mp3: 'audio/mpeg',
                wav: 'audio/wav'
              }
              if (mimeTypes[ext]) {
                res.setHeader('Content-Type', mimeTypes[ext])
              }
              fs.createReadStream(filePath).pipe(res)
              return
            }
          }
          next()
        })
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        round2: resolve('round2/index.html'),
        round3: resolve('round3/index.html')
      }
    }
  }
})
