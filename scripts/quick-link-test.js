#!/usr/bin/env node

/**
 * Quick Link Test for Video-IA.net
 * Simple and reliable link testing
 */

const { spawn } = require('child_process');

class QuickLinkTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: []
    };
  }

  async runCommand(command, name) {
    return new Promise((resolve) => {
      console.log(`\n🔧 Running ${name}...`);
      console.log('='.repeat(40));
      
      const child = spawn(command, [], { 
        shell: true, 
        stdio: 'inherit' 
      });
      
      child.on('close', (code) => {
        const result = {
          name,
          command,
          exitCode: code,
          status: code === 0 ? 'success' : 'failed'
        };
        
        this.results.tests.push(result);
        
        console.log(`\n${result.status === 'success' ? '✅' : '❌'} ${name} completed with exit code ${code}`);
        resolve(result);
      });
      
      child.on('error', (error) => {
        console.log(`❌ ${name} failed to start: ${error.message}`);
        const result = {
          name,
          command,
          exitCode: -1,
          status: 'failed',
          error: error.message
        };
        this.results.tests.push(result);
        resolve(result);
      });
    });
  }

  async run() {
    console.log('🚀 Quick Link Test Suite');
    console.log(`Timestamp: ${this.results.timestamp}`);
    console.log('='.repeat(50));
    
    // Run tests sequentially
    await this.runCommand('npm run test:links:optimized', 'Optimized Link Checker');
    await this.runCommand('npx playwright test tests/e2e/link-checker.spec.ts --project=chromium --reporter=line', 'Playwright E2E Tests');
    
    // Generate summary
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 QUICK LINK TEST SUMMARY');
    console.log('='.repeat(60));
    
    const totalTests = this.results.tests.length;
    const passedTests = this.results.tests.filter(t => t.status === 'success').length;
    const failedTests = totalTests - passedTests;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log(`\n📈 RESULTS:`);
    console.log(`   Total tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   📊 Success rate: ${successRate}%`);
    
    console.log(`\n🔧 TEST DETAILS:`);
    this.results.tests.forEach(test => {
      const status = test.status === 'success' ? '✅' : '❌';
      console.log(`   ${status} ${test.name} (exit code: ${test.exitCode})`);
    });
    
    console.log(`\n💡 RECOMMENDATIONS:`);
    if (successRate === 100) {
      console.log('   🎉 All tests passed! Your links are working perfectly.');
    } else if (successRate >= 50) {
      console.log('   ⚠️ Some tests failed. Review the output above.');
    } else {
      console.log('   🚨 Multiple test failures. Check your server and configuration.');
    }
    
    console.log(`\n🔄 Individual test commands:`);
    console.log('   npm run test:links:optimized');
    console.log('   npm run test:links:e2e');
  }
}

// Run the quick test suite
async function main() {
  try {
    const tester = new QuickLinkTester();
    await tester.run();
  } catch (error) {
    console.error('❌ Quick link test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = QuickLinkTester; 