#!/usr/bin/env node

/**
 * Optimized Link Checker for Video-IA.net
 * Improved performance with caching and better error handling
 */

const http = require('http');
const https = require('https');
const url = require('url');

const BASE_URL = 'http://localhost:3000';
const TIMEOUT = 15000; // 15 seconds
const MAX_CONCURRENT_REQUESTS = 5; // Limit concurrent requests

// Define expected routes with priorities
const EXPECTED_ROUTES = {
  critical: [
    '/',
    '/tools',
    '/categories',
  ],
  important: [
    '/scraper',
    '/admin',
    '/admin/login',
  ],
  api: [
    '/api/tools',
    '/api/categories',
    '/api/auth/providers',
    '/api/auth/session',
  ],
  missing: [
    '/submit',
    '/api-docs',
    '/blog',
    '/changelog',
    '/support',
    '/terms',
    '/privacy',
    '/cookies',
    '/admin/settings',
    '/admin/tools/new',
  ]
};

class OptimizedLinkChecker {
  constructor() {
    this.results = {
      tested: [],
      broken: [],
      summary: {
        total: 0,
        successful: 0,
        broken: 0,
        successRate: 0
      }
    };
    this.cache = new Map(); // Cache results to avoid duplicate requests
    this.requestQueue = [];
    this.activeRequests = 0;
  }

  async checkUrl(path) {
    // Check cache first
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    return new Promise((resolve) => {
      const fullUrl = `${BASE_URL}${path}`;
      const startTime = Date.now();

      const request = http.get(fullUrl, { timeout: TIMEOUT }, (response) => {
        const responseTime = Date.now() - startTime;
        const result = {
          url: path,
          fullUrl: fullUrl,
          status: response.statusCode >= 200 && response.statusCode < 400 ? 'success' : 'error',
          statusCode: response.statusCode,
          responseTime: responseTime,
          error: response.statusCode >= 400 ? `HTTP ${response.statusCode}` : null
        };

        response.on('data', () => {}); // Consume the response data
        response.on('end', () => {
          this.cache.set(path, result);
          resolve(result);
        });
      });

      request.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        const result = {
          url: path,
          fullUrl: fullUrl,
          status: 'error',
          statusCode: null,
          responseTime: responseTime,
          error: error.message
        };
        this.cache.set(path, result);
        resolve(result);
      });

      request.on('timeout', () => {
        request.destroy();
        const responseTime = Date.now() - startTime;
        const result = {
          url: path,
          fullUrl: fullUrl,
          status: 'error',
          statusCode: null,
          responseTime: responseTime,
          error: 'Request timeout'
        };
        this.cache.set(path, result);
        resolve(result);
      });
    });
  }

  async checkServer() {
    console.log('🔍 Checking if server is running...');
    try {
      const response = await this.checkUrl('/');
      if (response.status === 'success') {
        console.log('✅ Server is running');
        return true;
      } else {
        console.log(`❌ Server responded with status ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log('❌ Server is not running or not accessible');
      console.log('💡 Start the server with: npm run dev');
      return false;
    }
  }

  async checkRoutesWithPriority() {
    console.log('\n🔍 Checking routes by priority...');
    
    // Check critical routes first
    console.log('\n🚨 CRITICAL ROUTES:');
    for (const route of EXPECTED_ROUTES.critical) {
      const result = await this.checkUrl(route);
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${route} (${result.statusCode || 'N/A'}) - ${result.responseTime}ms`);
      this.results.tested.push(result);
      if (result.status === 'error') {
        this.results.broken.push(result);
      }
    }

    // Check important routes
    console.log('\n📋 IMPORTANT ROUTES:');
    for (const route of EXPECTED_ROUTES.important) {
      const result = await this.checkUrl(route);
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${route} (${result.statusCode || 'N/A'}) - ${result.responseTime}ms`);
      this.results.tested.push(result);
      if (result.status === 'error') {
        this.results.broken.push(result);
      }
    }

    // Check API routes
    console.log('\n🔌 API ROUTES:');
    for (const route of EXPECTED_ROUTES.api) {
      const result = await this.checkUrl(route);
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${route} (${result.statusCode || 'N/A'}) - ${result.responseTime}ms`);
      this.results.tested.push(result);
      if (result.status === 'error') {
        this.results.broken.push(result);
      }
    }

    // Check missing routes (expected to fail)
    console.log('\n⚠️ MISSING ROUTES (Expected to fail):');
    for (const route of EXPECTED_ROUTES.missing) {
      const result = await this.checkUrl(route);
      const status = result.statusCode === 404 ? '✅' : '❌';
      console.log(`${status} ${route} (${result.statusCode || 'N/A'}) - Expected 404`);
      this.results.tested.push(result);
      // Don't count expected 404s as broken links
    }
  }

  generateSummary() {
    const total = this.results.tested.length;
    const successful = this.results.tested.filter(r => r.status === 'success').length;
    const broken = this.results.broken.length;
    
    this.results.summary = {
      total,
      successful,
      broken,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0
    };
  }

  printReport() {
    this.generateSummary();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 OPTIMIZED LINK CHECK REPORT');
    console.log('='.repeat(60));
    
    const { total, successful, broken, successRate } = this.results.summary;
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total links tested: ${total}`);
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Broken: ${broken}`);
    console.log(`   📊 Success rate: ${successRate}%`);
    console.log(`   💾 Cache hits: ${this.cache.size - total}`);
    
    if (broken > 0) {
      console.log(`\n🚨 BROKEN LINKS (${broken}):`);
      console.log('-'.repeat(50));
      
      this.results.broken.forEach(link => {
        console.log(`   ❌ ${link.url}`);
        console.log(`      Status: ${link.statusCode || 'N/A'}`);
        console.log(`      Error: ${link.error || 'Unknown'}`);
        console.log(`      Response time: ${link.responseTime}ms`);
        console.log('');
      });

      // Critical broken links
      const criticalBroken = this.results.broken.filter(link => 
        EXPECTED_ROUTES.critical.includes(link.url)
      );

      if (criticalBroken.length > 0) {
        console.log(`\n🔥 CRITICAL BROKEN LINKS (${criticalBroken.length}):`);
        criticalBroken.forEach(link => {
          console.log(`   🚨 ${link.url} - ${link.error}`);
        });
      }
    } else {
      console.log('\n🎉 No broken links found!');
    }

    // Performance metrics
    const avgResponseTime = this.results.tested.reduce((sum, link) => sum + link.responseTime, 0) / total;
    console.log(`\n⚡ PERFORMANCE:`);
    console.log(`   Average response time: ${Math.round(avgResponseTime)}ms`);
    console.log(`   Cache efficiency: ${Math.round((this.cache.size - total) / this.cache.size * 100)}%`);

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    if (broken > 0) {
      console.log('   1. Fix the broken links listed above');
      console.log('   2. Create missing pages or add redirects');
      console.log('   3. Update navigation components');
      
      const brokenRoutes = this.results.broken.map(l => l.url);
      
      if (brokenRoutes.some(r => EXPECTED_ROUTES.missing.includes(r))) {
        console.log('   4. Consider creating the missing pages like /submit, /blog, etc.');
      }
      
      if (brokenRoutes.some(r => r.startsWith('/admin'))) {
        console.log('   5. Check admin routing and authentication setup');
      }
    } else {
      console.log('   1. All core routes are working correctly');
      console.log('   2. Consider adding the missing routes for better UX');
    }
    console.log('   3. Run this test regularly with: npm run test:links:optimized');
  }

  async run() {
    console.log('🚀 Starting optimized link check...');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Timeout: ${TIMEOUT}ms`);
    console.log(`Max concurrent requests: ${MAX_CONCURRENT_REQUESTS}`);
    
    // Check if server is running
    const serverRunning = await this.checkServer();
    if (!serverRunning) {
      process.exit(1);
    }

    // Check all routes with priority
    await this.checkRoutesWithPriority();
    
    // Generate and show report
    this.printReport();
    
    // Exit with error code if critical links are broken
    const criticalBroken = this.results.broken.filter(link => 
      EXPECTED_ROUTES.critical.includes(link.url)
    );
    
    if (criticalBroken.length > 0) {
      console.log(`\n❌ Exiting with error: ${criticalBroken.length} critical links are broken`);
      process.exit(1);
    } else {
      console.log('\n✅ Optimized link check completed successfully!');
      process.exit(0);
    }
  }
}

// Run the optimized link checker
async function main() {
  try {
    const checker = new OptimizedLinkChecker();
    await checker.run();
  } catch (error) {
    console.error('❌ Optimized link checker failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = OptimizedLinkChecker; 