import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'mediapipe': ['@mediapipe/tasks-vision'],
          'r3f': ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // 优化 assets 加载
    assetsInlineLimit: 4096, // 小于 4KB 的文件内联为 base64
  },
  // 优化静态资源加载
  server: {
    fs: {
      // 允许访问项目根目录外的文件
      strict: false
    }
  }
})
