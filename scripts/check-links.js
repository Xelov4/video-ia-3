#!/usr/bin/env node

/**
 * Comprehensive Link Checker for Video-IA.net
 * Checks all internal links, routes, and identifies broken links
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const TIMEOUT = 10000; // 10 seconds

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
    '/api/auth/csrf',
  ],
  // Known missing routes (expected to fail)
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

class LinkChecker {
  constructor() {
    this.results = {
      tested: [],
      broken: [],
      external: [],
      summary: {
        total: 0,
        successful: 0,
        broken: 0,
        external: 0,
        successRate: 0
      }
    };
    
    this.testedUrls = new Set();
    this.axios = axios.create({
      timeout: TIMEOUT,
      validateStatus: () => true // Don't throw on 4xx/5xx
    });
  }

  async checkServer() {
    console.log('🔍 Checking if server is running...');
    try {
      const response = await this.axios.get(BASE_URL);
      if (response.status === 200) {
        console.log('✅ Server is running');
        return true;
      } else {
        console.log(`❌ Server responded with status ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log('❌ Server is not running or not accessible');
      console.log('💡 Start the server with: npm run dev');
      return false;
    }
  }

  async checkUrl(url, context = 'direct') {
    if (this.testedUrls.has(url)) {
      return this.results.tested.find(r => r.url === url);
    }

    this.testedUrls.add(url);
    
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    const result = {
      url,
      fullUrl,
      context,
      status: 'unknown',
      statusCode: null,
      error: null,
      responseTime: null,
      isExternal: url.startsWith('http') && !url.startsWith(BASE_URL)
    };

    const startTime = Date.now();

    try {
      const response = await this.axios.get(fullUrl);
      result.responseTime = Date.now() - startTime;
      result.statusCode = response.status;
      
      if (response.status >= 200 && response.status < 400) {
        result.status = 'success';
      } else {
        result.status = 'error';
        result.error = `HTTP ${response.status}`;
      }
      
    } catch (error) {
      result.responseTime = Date.now() - startTime;
      result.status = 'error';
      result.error = error.code || error.message;
      
      if (error.response) {
        result.statusCode = error.response.status;
      }
    }

    this.results.tested.push(result);
    
    if (result.status === 'error') {
      this.results.broken.push(result);
    }
    
    if (result.isExternal) {
      this.results.external.push(result);
    }

    return result;
  }

  async extractLinksFromPage(url) {
    try {
      const response = await this.axios.get(`${BASE_URL}${url}`);
      if (response.status !== 200) {
        return [];
      }

      const $ = cheerio.load(response.data);
      const links = [];

      $('a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        const text = $(elem).text().trim() || 'No text';
        
        if (href && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          links.push({
            href,
            text,
            page: url
          });
        }
      });

      return links;
    } catch (error) {
      console.log(`❌ Failed to extract links from ${url}: ${error.message}`);
      return [];
    }
  }

  async checkStaticRoutes() {
    console.log('\n🔍 Checking static routes...');
    
    const allRoutes = [
      ...EXPECTED_ROUTES.public,
      ...EXPECTED_ROUTES.admin,
      ...EXPECTED_ROUTES.api
    ];

    for (const route of allRoutes) {
      const result = await this.checkUrl(route, 'static-route');
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${route} (${result.statusCode}) - ${result.responseTime}ms`);
    }
  }

  async checkKnownMissingRoutes() {
    console.log('\n🔍 Checking known missing routes (expected to fail)...');
    
    for (const route of EXPECTED_ROUTES.missing) {
      const result = await this.checkUrl(route, 'missing-route');
      const status = result.status === 'success' ? '🎉' : '⚠️';
      console.log(`${status} ${route} (${result.statusCode}) - Expected missing`);
    }
  }

  async checkPageLinks(pagesToCheck = ['/', '/tools', '/categories']) {
    console.log('\n🔍 Checking links found on pages...');
    
    for (const page of pagesToCheck) {
      console.log(`\n📄 Extracting links from ${page}...`);
      const links = await this.extractLinksFromPage(page);
      
      console.log(`Found ${links.length} links`);
      
      // Check internal links only
      const internalLinks = links.filter(link => 
        !link.href.startsWith('http') || link.href.startsWith(BASE_URL)
      );
      
      for (const link of internalLinks.slice(0, 10)) { // Limit to first 10 to avoid too many requests
        const result = await this.checkUrl(link.href, `page-${page}`);
        const status = result.status === 'success' ? '✅' : '❌';
        console.log(`  ${status} ${link.href} "${link.text}" (${result.statusCode})`);
      }
    }
  }

  async checkDynamicRoutes() {
    console.log('\n🔍 Checking dynamic routes (tools and categories)...');
    
    try {
      // Get some real tools
      const toolsResponse = await this.axios.get(`${BASE_URL}/api/tools?limit=5`);
      if (toolsResponse.status === 200 && toolsResponse.data.tools) {
        console.log(`Testing ${toolsResponse.data.tools.length} tool routes...`);
        
        for (const tool of toolsResponse.data.tools) {
          const toolUrl = `/tools/${tool.slug || tool.id}`;
          const result = await this.checkUrl(toolUrl, 'dynamic-tool');
          const status = result.status === 'success' ? '✅' : '❌';
          console.log(`  ${status} ${toolUrl} - ${tool.toolName} (${result.statusCode})`);
        }
      }
    } catch (error) {
      console.log('❌ Failed to check tool routes:', error.message);
    }

    try {
      // Get some real categories
      const categoriesResponse = await this.axios.get(`${BASE_URL}/api/categories?limit=5`);
      if (categoriesResponse.status === 200 && Array.isArray(categoriesResponse.data)) {
        console.log(`Testing ${categoriesResponse.data.length} category routes...`);
        
        for (const category of categoriesResponse.data) {
          const categoryUrl = `/categories/${category.slug}`;
          const result = await this.checkUrl(categoryUrl, 'dynamic-category');
          const status = result.status === 'success' ? '✅' : '❌';
          console.log(`  ${status} ${categoryUrl} - ${category.name} (${result.statusCode})`);
        }
      }
    } catch (error) {
      console.log('❌ Failed to check category routes:', error.message);
    }
  }

  generateSummary() {
    const total = this.results.tested.length;
    const successful = this.results.tested.filter(r => r.status === 'success').length;
    const broken = this.results.broken.length;
    const external = this.results.external.length;
    
    this.results.summary = {
      total,
      successful,
      broken,
      external,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0
    };
  }

  printReport() {
    this.generateSummary();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE LINK CHECK REPORT');
    console.log('='.repeat(60));
    
    const { total, successful, broken, external, successRate } = this.results.summary;
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total links tested: ${total}`);
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Broken: ${broken}`);
    console.log(`   🌐 External: ${external}`);
    console.log(`   📊 Success rate: ${successRate}%`);

    if (broken > 0) {
      console.log(`\n🚨 BROKEN LINKS (${broken}):`);
      console.log('-'.repeat(50));
      
      // Group by context
      const grouped = this.results.broken.reduce((acc, link) => {
        if (!acc[link.context]) acc[link.context] = [];
        acc[link.context].push(link);
        return acc;
      }, {});

      for (const [context, links] of Object.entries(grouped)) {
        console.log(`\n📄 Context: ${context}`);
        links.forEach(link => {
          console.log(`   ❌ ${link.url}`);
          console.log(`      Status: ${link.statusCode || 'N/A'}`);
          console.log(`      Error: ${link.error || 'Unknown'}`);
          console.log(`      Response time: ${link.responseTime}ms`);
        });
      }

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
      console.log('   2. Add redirects for moved pages');
      console.log('   3. Update navigation menus');
    }
    console.log('   4. Consider adding the missing routes or removing references to them');
    console.log('   5. Test regularly with: npm run test:links');
  }

  async saveReport() {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        baseUrl: BASE_URL,
        results: this.results
      };

      const reportPath = path.join(process.cwd(), 'link-check-report.json');
      await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
      console.log(`\n💾 Report saved to: ${reportPath}`);
    } catch (error) {
      console.log(`❌ Failed to save report: ${error.message}`);
    }
  }

  async run() {
    console.log('🚀 Starting comprehensive link check...');
    console.log(`Base URL: ${BASE_URL}`);
    
    // Check if server is running
    const serverRunning = await this.checkServer();
    if (!serverRunning) {
      process.exit(1);
    }

    // Run all checks
    await this.checkStaticRoutes();
    await this.checkKnownMissingRoutes();
    await this.checkPageLinks();
    await this.checkDynamicRoutes();
    
    // Generate and show report
    this.printReport();
    await this.saveReport();
    
    // Exit with error code if critical links are broken
    const criticalRoutes = [...EXPECTED_ROUTES.public, ...EXPECTED_ROUTES.admin];
    const criticalBroken = this.results.broken.filter(link => 
      criticalRoutes.includes(link.url)
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

// Install axios if not present
async function installDependencies() {
  try {
    require('axios');
    require('cheerio');
  } catch (error) {
    console.log('📦 Installing required dependencies...');
    const { execSync } = require('child_process');
    execSync('npm install axios cheerio --no-save', { stdio: 'inherit' });
  }
}

// Run the link checker
async function main() {
  try {
    await installDependencies();
    const checker = new LinkChecker();
    await checker.run();
  } catch (error) {
    console.error('❌ Link checker failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = LinkChecker;