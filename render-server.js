// Render.com serverio paleidimo failas
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import app from './src/index.js'

// Keičiame Cloudflare serveStatic į Node.js versiją
app.use('/static/*', serveStatic({ root: './public' }))

const port = process.env.PORT || 3000

console.log(`Server starting on port ${port}`)
serve({
  fetch: app.fetch,
  port: port
})

console.log(`🚀 Server running on http://localhost:${port}`)