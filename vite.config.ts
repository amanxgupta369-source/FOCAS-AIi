import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import evaluateHandler from './api/evaluate.js'
import chatHandler from './api/chat.js'
import statusHandler from './api/status.js'
import healthHandler from './api/health.js'

export default defineConfig(({ mode }) => {
  // Load environment variables into process.env
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  const serverApiPlugin = {
    name: 'focas-server-api',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url?.split('?')[0]
        if (url === '/api/evaluate') {
          return evaluateHandler(req, res)
        }
        if (url === '/api/chat') {
          return chatHandler(req, res)
        }
        if (url === '/api/status') {
          return statusHandler(req, res)
        }
        if (url === '/api/health') {
          return healthHandler(req, res)
        }
        next()
      })
    },
  }

  return {
    plugins: [react(), serverApiPlugin],
    server: {
      host: true,
      port: 5173,
    },
  }
})
