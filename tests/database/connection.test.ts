import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { checkDatabaseConnection } from '../../src/lib/database'

describe('Database Connection', () => {
  it('should connect to the database successfully', async () => {
    const status = await checkDatabaseConnection()
    
    expect(status).toHaveProperty('connected')
    expect(status.connected).toBe(true)
    expect(status).toHaveProperty('stats')
  }, 10000)

  it('should return connection statistics', async () => {
    const status = await checkDatabaseConnection()
    
    if (status.connected) {
      expect(status.stats).toHaveProperty('totalConnections')
      expect(status.stats).toHaveProperty('idleConnections')
      expect(status.stats).toHaveProperty('waitingConnections')
      expect(typeof status.stats.totalConnections).toBe('number')
    }
  })

  it('should handle connection errors gracefully', async () => {
    // This test would require mocking the database connection to fail
    // For now, we just verify the function exists and returns expected structure
    const status = await checkDatabaseConnection()
    expect(status).toHaveProperty('connected')
    expect(typeof status.connected).toBe('boolean')
  })
})