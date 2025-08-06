/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: [
    '<rootDir>/tests/**/*.(test|spec).(ts|js)',
    '<rootDir>/src/**/*.(test|spec).(ts|js)',
    '<rootDir>/app/**/*.(test|spec).(ts|js)'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.ts'],
  collectCoverageFrom: [
    'src/**/*.{js,ts,tsx}',
    'app/**/*.{js,ts,tsx}',
    '!src/**/*.d.ts',
    '!app/**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**'
  ],
  projects: [
    {
      displayName: 'API Tests',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/api/**/*.(test|spec).(ts|js)'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
    },
    {
      displayName: 'Database Tests', 
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/database/**/*.(test|spec).(ts|js)'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
    },
    {
      displayName: 'Component Tests',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/components/**/*.(test|spec).(ts|tsx)'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-react.ts']
    },
    {
      displayName: 'Integration Tests',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.(test|spec).(ts|js)'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
    }
  ],
  verbose: true,
  bail: false,
  clearMocks: true,
  restoreMocks: true
}

module.exports = config