#!/usr/bin/env tsx
/**
 * Tests de smoke pour détecter les régressions
 * Phase 1.3 : Configuration stricte temporaire
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestResult {
  name: string;
  success: boolean;
  output: string;
  duration: number;
}

class SmokeTestRunner {
  private results: TestResult[] = [];
  
  async runTest(name: string, command: string, timeout = 30000): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Running ${name}...`);
      const { stdout, stderr } = await execAsync(command, { timeout });
      const duration = Date.now() - startTime;
      
      const result: TestResult = {
        name,
        success: true,
        output: stdout + (stderr ? `\nSTDERR: ${stderr}` : ''),
        duration
      };
      
      this.results.push(result);
      console.log(`✅ ${name} passed (${duration}ms)`);
      return result;
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      const result: TestResult = {
        name,
        success: false,
        output: error.stdout + error.stderr || error.message,
        duration
      };
      
      this.results.push(result);
      console.log(`❌ ${name} failed (${duration}ms)`);
      return result;
    }
  }
  
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting smoke tests...\n');
    
    // Test 1: Compilation TypeScript
    await this.runTest(
      'TypeScript Compilation',
      'npm run type-check'
    );
    
    // Test 2: Build Next.js
    await this.runTest(
      'Next.js Build',
      'npm run build',
      120000 // 2 minutes pour le build
    );
    
    // Test 3: ESLint avec nos nouvelles règles
    await this.runTest(
      'ESLint Check (New Files)',
      'npx eslint src/types/unified.ts src/lib/adapters --config .eslintrc.strict.json'
    );
    
    // Test 4: Import des nouveaux types
    await this.runTest(
      'Import Test',
      'npx tsx -e "import { Category, adaptCategoryResponse } from \'./src/types/unified\'; console.log(\'Types imported successfully\');"'
    );
    
    // Test 5: Validation des adaptateurs
    await this.runTest(
      'Adapters Validation',
      'npx tsx -e "import { adaptCategoryResponse } from \'./src/lib/adapters\'; const result = adaptCategoryResponse({ id: 1, name: \'test\', tool_count: 5 }); console.log(\'Adapter works:\', result.toolCount);"'
    );
    
    this.printSummary();
  }
  
  private printSummary(): void {
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log('\n📊 SMOKE TESTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log('='.repeat(50));
    
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`\n📋 ${r.name}:`);
          console.log(r.output.slice(0, 500) + (r.output.length > 500 ? '...' : ''));
        });
      
      process.exit(1);
    } else {
      console.log('\n🎉 All smoke tests passed!');
      process.exit(0);
    }
  }
}

// Exécution des tests
if (require.main === module) {
  const runner = new SmokeTestRunner();
  runner.runAllTests().catch(error => {
    console.error('💥 Smoke tests runner crashed:', error);
    process.exit(1);
  });
}

export { SmokeTestRunner };