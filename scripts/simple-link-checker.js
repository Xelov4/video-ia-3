#!/usr/bin/env node

/**
 * Simple Link Checker for Video-IA.net
 * Uses native Node.js http module
 */

const http = require('http');
const https = require('https');
const url = require('url');

const BASE_URL = 'http://localhost:3000';

// Define expected routes
const EXPECTED_ROUTES = {
  public: [
    '/',
    '/tools',
    '/categories',
    '/scraper',
  ],
  admin: [
    '/admin',
    '/admin/login',
    '/admin/tools',
    '/admin/categories',
    '/admin/users',
    '/admin/analytics',
    '/admin/articles',
    '/admin/scraper',
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

class SimpleLinkChecker {
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
  }

  async checkUrl(path) {
    return new Promise((resolve, reject) => {
      const fullUrl = `${BASE_URL}${path}`;
      const startTime = Date.now();

      const request = http.get(fullUrl, (response) => {
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
        resolve(result);
      });

      request.setTimeout(10000, () => {
        request.destroy();
        const result = {
          url: path,
          fullUrl: fullUrl,
          status: 'error',
          statusCode: null,
          responseTime: Date.now() - startTime,
          error: 'Timeout'
        };
        resolve(result);
      });
    });
  }

  async checkServer() {
    console.log('🔍 Checking if server is running...');
    try {
      const result = await this.checkUrl('/');
      if (result.status === 'success') {
        console.log('✅ Server is running');
        return true;
      } else {
        console.log(`❌ Server responded with status ${result.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log('❌ Server is not running or not accessible');
      console.log('💡 Start the server with: npm run dev');
      return false;
    }
  }

  async checkRoutes(routes, category) {
    console.log(`\n🔍 Checking ${category} routes...`);
    
    for (const route of routes) {
      const result = await this.checkUrl(route);
      this.results.tested.push(result);
      
      if (result.status === 'error') {
        this.results.broken.push(result);
      }
      
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${route} (${result.statusCode}) - ${result.responseTime}ms`);
      
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
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
    console.log('📊 LINK CHECK REPORT');
    console.log('='.repeat(60));
    
    const { total, successful, broken, successRate } = this.results.summary;
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total links tested: ${total}`);
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Broken: ${broken}`);
    console.log(`   📊 Success rate: ${successRate}%`);

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
      const criticalRoutes = [...EXPECTED_ROUTES.public, ...EXPECTED_ROUTES.admin];
      const criticalBroken = this.results.broken.filter(link => 
        criticalRoutes.includes(link.url)
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

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    if (broken > 0) {
      console.log('   1. Fix the broken links listed above');
      console.log('   2. Create missing pages or add redirects');
      console.log('   3. Update navigation components');
      
      // Specific recommendations based on broken links
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
    console.log('   3. Run this test regularly with: npm run test:links');
  }

  async run() {
    console.log('🚀 Starting Link Check...');
    console.log(`Base URL: ${BASE_URL}`);
    
    // Check if server is running
    const serverRunning = await this.checkServer();
    if (!serverRunning) {
      process.exit(1);
    }

    // Check all route categories
    await this.checkRoutes(EXPECTED_ROUTES.public, 'Public');
    await this.checkRoutes(EXPECTED_ROUTES.admin, 'Admin');
    await this.checkRoutes(EXPECTED_ROUTES.api, 'API');
    await this.checkRoutes(EXPECTED_ROUTES.missing, 'Missing (Expected to fail)');
    
    // Generate and show report
    this.printReport();
    
    // Exit with error code if critical links are broken
    const criticalRoutes = [...EXPECTED_ROUTES.public, ...EXPECTED_ROUTES.admin];
    const criticalBroken = this.results.broken.filter(link => 
      criticalRoutes.includes(link.url) && !EXPECTED_ROUTES.missing.includes(link.url)
    );
    
    if (criticalBroken.length > 0) {
      console.log(`\n❌ Exiting with error: ${criticalBroken.length} critical links are broken`);
      process.exit(1);
    } else {
      console.log('\n✅ Link check completed successfully!');
      process.exit(0);
    }
  }
}

// Run the link checker
async function main() {
  try {
    const checker = new SimpleLinkChecker();
    await checker.run();
  } catch (error) {
    console.error('❌ Link checker failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}