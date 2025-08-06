import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import supertest from 'supertest'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3001

let app: any
let handle: any
let server: any

beforeAll(async () => {
  app = next({ dev, hostname, port })
  handle = app.getRequestHandler()
  await app.prepare()
  
  server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url!, true)
    await handle(req, res, parsedUrl)
  }).listen(port)
}, 30000)

afterAll(async () => {
  if (server) {
    server.close()
  }
  if (app) {
    await app.close()
  }
})

describe('/api/tools', () => {
  describe('GET /api/tools', () => {
    it('should return tools with default pagination', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/tools')
        .expect(200)
      
      expect(response.body).toHaveProperty('tools')
      expect(response.body).toHaveProperty('totalCount')
      expect(response.body).toHaveProperty('currentPage', 1)
      expect(response.body).toHaveProperty('totalPages')
      expect(Array.isArray(response.body.tools)).toBe(true)
    })

    it('should handle pagination parameters', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/tools?page=2&limit=5')
        .expect(200)
      
      expect(response.body).toHaveProperty('currentPage', 2)
      expect(response.body.tools.length).toBeLessThanOrEqual(5)
    })

    it('should handle search query', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/tools?q=video')
        .expect(200)
      
      expect(response.body).toHaveProperty('tools')
      expect(response.body).toHaveProperty('totalCount')
    })

    it('should handle category filter', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/tools?category=video-editing')
        .expect(200)
      
      expect(response.body).toHaveProperty('tools')
      if (response.body.tools.length > 0) {
        expect(response.body.tools[0]).toHaveProperty('toolCategory', 'video-editing')
      }
    })

    it('should handle invalid pagination gracefully', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/tools?page=-1&limit=0')
        .expect(200)
      
      expect(response.body.currentPage).toBeGreaterThan(0)
    })

    it('should handle featured tools filter', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/tools?featured=true')
        .expect(200)
      
      expect(response.body).toHaveProperty('tools')
      expect(Array.isArray(response.body.tools)).toBe(true)
    })
  })

  describe('Tool data structure', () => {
    it('should return tools with correct structure', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/tools?limit=1')
        .expect(200)
      
      if (response.body.tools.length > 0) {
        const tool = response.body.tools[0]
        expect(tool).toHaveProperty('id')
        expect(tool).toHaveProperty('toolName')
        expect(tool).toHaveProperty('toolCategory')
        expect(tool).toHaveProperty('toolLink')
        expect(tool).toHaveProperty('toolDescription')
        expect(tool).toHaveProperty('createdAt')
      }
    })
  })
})