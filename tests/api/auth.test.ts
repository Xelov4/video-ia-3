import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import supertest from 'supertest'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3004

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

describe('NextAuth API', () => {
  describe('GET /api/auth/providers', () => {
    it('should return available providers', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/auth/providers')
        .expect(200)
      
      expect(response.body).toHaveProperty('credentials')
      expect(response.body.credentials).toHaveProperty('name', 'credentials')
      expect(response.body.credentials).toHaveProperty('type', 'credentials')
    })
  })

  describe('GET /api/auth/session', () => {
    it('should return null session for unauthenticated user', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/auth/session')
        .expect(200)
      
      expect(response.body).toEqual({})
    })
  })

  describe('GET /api/auth/csrf', () => {
    it('should return CSRF token', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/auth/csrf')
        .expect(200)
      
      expect(response.body).toHaveProperty('csrfToken')
      expect(typeof response.body.csrfToken).toBe('string')
      expect(response.body.csrfToken.length).toBeGreaterThan(0)
    })
  })

  describe('POST /api/auth/callback/credentials', () => {
    it('should reject empty credentials', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .post('/api/auth/callback/credentials')
        .send({})
        .expect(401)
    })

    it('should reject invalid credentials', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .post('/api/auth/callback/credentials')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword',
          csrfToken: 'test-token'
        })
        .expect(401)
    })

    it('should accept valid admin credentials', async () => {
      // First get CSRF token
      const csrfResponse = await supertest(`http://localhost:${port}`)
        .get('/api/auth/csrf')
      
      const csrfToken = csrfResponse.body.csrfToken

      const response = await supertest(`http://localhost:${port}`)
        .post('/api/auth/callback/credentials')
        .send({
          email: 'admin@video-ia.net',
          password: 'admin123',
          csrfToken,
          json: true
        })
      
      // Should redirect or return success (302 or 200)
      expect([200, 302]).toContain(response.status)
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('url')
      }
    })
  })

  describe('GET /api/auth/signin', () => {
    it('should redirect to signin page', async () => {
      const response = await supertest(`http://localhost:${port}`)
        .get('/api/auth/signin')
        .expect(302)
      
      expect(response.headers.location).toContain('/admin/login')
    })
  })
})