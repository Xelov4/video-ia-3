#!/usr/bin/env node

/**
 * Complete Link Testing Suite for Video-IA.net
 * Runs all link tests and generates a comprehensive report
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class CompleteLinkTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      nodeTests: null,
      playwrightTests: null,
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        successRate: 0
      }
    };
  }

  async runNodeTests() {
    console.log('\n🔧 Running Node.js Link Tests...');
    console.log('='.repeat(50));
    
    try {
      // Run simple link checker
      console.log('\n📋 Simple Link Checker:');
      const simpleResult = execSync('npm run test:links', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log(simpleResult);
      
      // Run optimized link checker
      console.log('\n⚡ Optimized Link Checker:');
      const optimizedResult = execSync('npm run test:links:optimized', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log(optimizedResult);
      
      this.results.nodeTests = {
        simple: simpleResult,
        optimized: optimizedResult,
        status: 'success'
      };
      
      return true;
    } catch (error) {
      console.log(`❌ Node.js tests failed: ${error.message}`);
      this.results.nodeTests = {
        error: error.message,
        status: 'failed'
      };
      return false;
    }
  }

  async runPlaywrightTests() {
    console.log('\n🌐 Running Playwright E2E Tests...');
    console.log('='.repeat(50));
    
    try {
      const playwrightResult = execSync('npx playwright test tests/e2e/link-checker.spec.ts --project=chromium --reporter=line', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log(playwrightResult);
      
      this.results.playwrightTests = {
        output: playwrightResult,
        status: 'success'
      };
      
      return true;
    } catch (error) {
      console.log(`❌ Playwright tests failed: ${error.message}`);
      this.results.playwrightTests = {
        error: error.message,
        status: 'failed'
      };
      return false;
    }
  }

  generateSummary() {
    const tests = [
      { name: 'Node.js Simple', result: this.results.nodeTests },
      { name: 'Node.js Optimized', result: this.results.nodeTests },
      { name: 'Playwright E2E', result: this.results.playwrightTests }
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
      if (test.result && test.result.status === 'success') {
        passed++;
      } else {
        failed++;
      }
    });
    
    this.results.summary = {
      totalTests: tests.length,
      passedTests: passed,
      failedTests: failed,
      successRate: Math.round((passed / tests.length) * 100)
    };
  }

  async saveReport() {
    try {
      const reportPath = path.join(process.cwd(), 'complete-link-test-report.json');
      await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Complete report saved to: ${reportPath}`);
    } catch (error) {
      console.log(`❌ Failed to save report: ${error.message}`);
    }
  }

  printFinalReport() {
    console.log('\n' + '='.repeat(70));
    console.log('🎯 COMPLETE LINK TESTING SUITE REPORT');
    console.log('='.repeat(70));
    
    const { totalTests, passedTests, failedTests, successRate } = this.results.summary;
    
    console.log(`\n📊 FINAL SUMMARY:`);
    console.log(`   Total test suites: ${totalTests}`);
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   📈 Success rate: ${successRate}%`);
    
    console.log(`\n🔧 TEST DETAILS:`);
    
    if (this.results.nodeTests) {
      const status = this.results.nodeTests.status === 'success' ? '✅' : '❌';
      console.log(`   ${status} Node.js Tests: ${this.results.nodeTests.status}`);
    }
    
    if (this.results.playwrightTests) {
      const status = this.results.playwrightTests.status === 'success' ? '✅' : '❌';
      console.log(`   ${status} Playwright Tests: ${this.results.playwrightTests.status}`);
    }
    
    console.log(`\n💡 RECOMMENDATIONS:`);
    if (successRate === 100) {
      console.log('   🎉 All tests passed! Your links are in excellent condition.');
      console.log('   📅 Continue running these tests regularly to maintain quality.');
    } else if (successRate >= 80) {
      console.log('   ⚠️ Most tests passed. Review failed tests and fix issues.');
      console.log('   🔍 Check the detailed output above for specific problems.');
    } else {
      console.log('   🚨 Multiple test failures detected. Immediate attention required.');
      console.log('   🔧 Fix critical issues before deploying.');
    }
    
    console.log(`\n🔄 To run individual tests:`);
    console.log('   npm run test:links          # Simple Node.js test');
    console.log('   npm run test:links:optimized # Optimized Node.js test');
    console.log('   npm run test:links:e2e       # Playwright E2E test');
    console.log('   npm run test:all-links       # Complete test suite');
  }

  async run() {
    console.log('🚀 Starting Complete Link Testing Suite...');
    console.log(`Timestamp: ${this.results.timestamp}`);
    
    // Run Node.js tests
    const nodeSuccess = await this.runNodeTests();
    
    // Run Playwright tests
    const playwrightSuccess = await this.runPlaywrightTests();
    
    // Generate summary
    this.generateSummary();
    
    // Save report
    await this.saveReport();
    
    // Print final report
    this.printFinalReport();
    
    // Exit with appropriate code
    if (this.results.summary.successRate === 100) {
      console.log('\n✅ All link tests completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Some link tests failed. Please review the report.');
      process.exit(1);
    }
  }
}

// Run the complete test suite
async function main() {
  try {
    const tester = new CompleteLinkTester();
    await tester.run();
  } catch (error) {
    console.error('❌ Complete link testing suite failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CompleteLinkTester; 