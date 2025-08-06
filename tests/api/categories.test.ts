import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import supertest from 'supertest'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3002

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

describe('/api/categories', () => {
  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/categories')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      if (response.body.length > 0) {
        const category = response.body[0]
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('slug')
        expect(category).toHaveProperty('tool_count')
      }
    })

    it('should handle featured categories filter', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/categories?featured=true')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      if (response.body.length > 0) {
        response.body.forEach((category: any) => {
          expect(category.is_featured).toBe(true)
        })
      }
    })

    it('should handle limit parameter', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/categories?limit=3')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeLessThanOrEqual(3)
    })

    it('should return categories sorted by tool count', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/categories?limit=5')
        .expect(200)
      
      if (response.body.length > 1) {
        for (let i = 0; i < response.body.length - 1; i++) {
          expect(response.body[i].tool_count).toBeGreaterThanOrEqual(
            response.body[i + 1].tool_count
          )
        }
      }
    })
  })

  describe('Category data structure', () => {
    it('should return categories with correct structure', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/categories?limit=1')
        .expect(200)
      
      if (response.body.length > 0) {
        const category = response.body[0]
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('slug')
        expect(category).toHaveProperty('description')
        expect(category).toHaveProperty('tool_count')
        expect(category).toHaveProperty('is_featured')
        expect(category).toHaveProperty('created_at')
        
        expect(typeof category.id).toBe('number')
        expect(typeof category.name).toBe('string')
        expect(typeof category.slug).toBe('string')
        expect(typeof category.tool_count).toBe('number')
        expect(typeof category.is_featured).toBe('boolean')
      }
    })
  })
})