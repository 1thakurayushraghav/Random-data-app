import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react(), tailwindcss()],

    server: {
      proxy: {
        '/api/cpcb': {
          target: env.VITE_CPCB_API_URL,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})