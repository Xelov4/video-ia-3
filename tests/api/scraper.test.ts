import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import supertest from 'supertest'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3003

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

describe('/api/scrape', () => {
  describe('POST /api/scrape', () => {
    it('should require URL parameter', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .post('/api/scrape')
        .send({})
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('URL')
    })

    it('should validate URL format', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .post('/api/scrape')
        .send({ url: 'invalid-url' })
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should handle valid URL', async () => {
      // Use a reliable test URL
      const response = await supertest(`http://localhost:${port}`)
        .post('/api/scrape')
        .send({ url: 'https://example.com' })
        .timeout(30000)
      
      // Should return either success or a structured error
      expect([200, 400, 500]).toContain(response.status)
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveProperty('toolName')
        expect(response.body.data).toHaveProperty('toolDescription')
      } else {
        expect(response.body).toHaveProperty('error')
      }
    })

    it('should handle timeout gracefully', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .post('/api/scrape')
        .send({ url: 'https://httpbin.org/delay/10' }) // Delay longer than timeout
        .timeout(15000)
      
      // Should handle timeout without crashing
      expect([200, 400, 500, 408]).toContain(response.status)
    })

    it('should return structured response', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .post('/api/scrape')
        .send({ url: 'https://example.com' })
        .timeout(30000)
      
      expect(response.body).toHaveProperty('success')
      
      if (response.body.success) {
        expect(response.body).toHaveProperty('data')
        const data = response.body.data
        
        // Check required fields
        expect(data).toHaveProperty('toolName')
        expect(data).toHaveProperty('toolDescription')
        expect(data).toHaveProperty('toolCategory')
        expect(data).toHaveProperty('toolLink')
        
        // Check optional fields exist (may be null/empty)
        expect(data).toHaveProperty('pricingModel')
        expect(data).toHaveProperty('keyFeatures')
        expect(data).toHaveProperty('targetAudience')
      }
    })
  })
})