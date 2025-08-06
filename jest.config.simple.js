/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.(js|ts)', '**/tests/**/*.spec.(js|ts)'],
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.{js,ts,tsx}',
    'app/**/*.{js,ts,tsx}',
    '!**/node_modules/**',
  ],
}

module.exports = config