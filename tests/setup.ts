import { config } from 'dotenv'

// Load environment variables for testing
config({ path: '.env.local' })

// Global test timeout
jest.setTimeout(30000)

// Mock console.log for cleaner test output (except for errors)
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}