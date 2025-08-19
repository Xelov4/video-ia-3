#!/usr/bin/env tsx
/**
 * Script d'analyse approfondie des erreurs TypeScript
 * Phase 2.1 : Classification et priorisation intelligente
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

interface TypeScriptError {
  file: string;
  line: number;
  column: number;
  errorCode: string;
  message: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  fixStrategy: string;
}

interface ErrorAnalysis {
  totalErrors: number;
  errorsByCategory: Record<string, TypeScriptError[]>;
  errorsByFile: Record<string, TypeScriptError[]>;
  criticalFiles: string[];
  recommendations: string[];
}

class TypeScriptErrorAnalyzer {
  private errors: TypeScriptError[] = [];

  async analyzeErrors(): Promise<ErrorAnalysis> {
    console.log('🔍 Analyzing TypeScript errors...');
    
    // Capture all TypeScript errors
    const rawErrors = await this.captureTypeScriptErrors();
    
    // Parse and classify each error
    this.errors = rawErrors.map(error => this.parseAndClassifyError(error));
    
    // Generate analysis
    const analysis = this.generateAnalysis();
    
    // Save detailed report
    await this.saveDetailedReport(analysis);
    
    return analysis;
  }

  private async captureTypeScriptErrors(): Promise<string[]> {
    try {
      const { stderr } = await execAsync('npm run type-check', { timeout: 60000 });
      return [];
    } catch (error: any) {
      if (error.stderr) {
        return error.stderr
          .split('\n')
          .filter((line: string) => line.includes(': error TS'))
          .map((line: string) => line.trim());
      }
      return [];
    }
  }

  private parseAndClassifyError(rawError: string): TypeScriptError {
    // Parse error format: file(line,column): error TSxxxx: message
    const match = rawError.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
    
    if (!match) {
      return {
        file: 'unknown',
        line: 0,
        column: 0,
        errorCode: 'TS0000',
        message: rawError,
        category: 'parsing-error',
        severity: 'low',
        fixStrategy: 'manual-review'
      };
    }

    const [, file, line, column, errorCode, message] = match;
    
    return {
      file,
      line: parseInt(line),
      column: parseInt(column),
      errorCode,
      message,
      category: this.categorizeError(errorCode, message),
      severity: this.determineSeverity(errorCode, message, file),
      fixStrategy: this.determineFixStrategy(errorCode, message)
    };
  }

  private categorizeError(errorCode: string, message: string): string {
    // Property access errors
    if (message.includes('Property') && message.includes('does not exist')) {
      return 'property-access';
    }
    
    // Type assignment errors
    if (message.includes('is not assignable to')) {
      if (message.includes('unknown')) {
        return 'unknown-type';
      }
      if (message.includes('ReactNode')) {
        return 'react-type';
      }
      if (message.includes('Record<string, unknown>')) {
        return 'record-type';
      }
      return 'type-assignment';
    }
    
    // Undefined/null errors
    if (message.includes('possibly') && (message.includes('undefined') || message.includes('null'))) {
      return 'undefined-null';
    }
    
    // Function overload errors
    if (message.includes('No overload matches')) {
      return 'function-overload';
    }
    
    // Index signature errors
    if (message.includes('Index signature') && message.includes('missing')) {
      return 'index-signature';
    }

    // Props mismatch
    if (message.includes('IntrinsicAttributes')) {
      return 'component-props';
    }

    // Default category
    return 'other';
  }

  private determineSeverity(errorCode: string, message: string, file: string): 'critical' | 'high' | 'medium' | 'low' {
    // Critical: Blocks compilation of key files
    const keyFiles = ['page.tsx', 'layout.tsx', 'route.ts'];
    if (keyFiles.some(keyFile => file.includes(keyFile))) {
      return 'critical';
    }

    // High: Property access errors (tool_count issues)
    if (message.includes('tool_count') || message.includes('toolCount')) {
      return 'high';
    }

    // High: Component props mismatch
    if (message.includes('IntrinsicAttributes')) {
      return 'high';
    }

    // High: Unknown type assignments in critical flows
    if (message.includes('unknown') && message.includes('ReactNode')) {
      return 'high';
    }

    // Medium: General type assignments
    if (message.includes('is not assignable to')) {
      return 'medium';
    }

    // Low: Everything else
    return 'low';
  }

  private determineFixStrategy(errorCode: string, message: string): string {
    if (message.includes('tool_count')) {
      return 'use-adapters';
    }
    
    if (message.includes('unknown') && message.includes('ReactNode')) {
      return 'type-assertion-safe';
    }
    
    if (message.includes('possibly undefined')) {
      return 'null-check';
    }
    
    if (message.includes('IntrinsicAttributes')) {
      return 'props-interface';
    }
    
    if (message.includes('No overload matches')) {
      return 'function-signature';
    }
    
    return 'manual-analysis';
  }

  private generateAnalysis(): ErrorAnalysis {
    const errorsByCategory = this.groupBy(this.errors, 'category');
    const errorsByFile = this.groupBy(this.errors, 'file');
    
    // Identify critical files (most errors + high severity)
    const criticalFiles = Object.entries(errorsByFile)
      .filter(([_, errors]) => {
        const criticalErrors = errors.filter(e => e.severity === 'critical' || e.severity === 'high');
        return criticalErrors.length >= 3 || errors.length >= 10;
      })
      .map(([file]) => file)
      .slice(0, 10); // Top 10 critical files

    const recommendations = this.generateRecommendations(errorsByCategory, criticalFiles);

    return {
      totalErrors: this.errors.length,
      errorsByCategory,
      errorsByFile,
      criticalFiles,
      recommendations
    };
  }

  private generateRecommendations(errorsByCategory: Record<string, TypeScriptError[]>, criticalFiles: string[]): string[] {
    const recommendations: string[] = [];

    // Property access recommendations
    if (errorsByCategory['property-access']?.length > 0) {
      recommendations.push(
        `🔧 ${errorsByCategory['property-access'].length} property access errors detected. ` +
        'Use adaptCategoryResponse/adaptToolResponse from Phase 1 to fix tool_count/toolCount issues.'
      );
    }

    // Unknown type recommendations  
    if (errorsByCategory['unknown-type']?.length > 0) {
      recommendations.push(
        `🛡️ ${errorsByCategory['unknown-type'].length} unknown type errors detected. ` +
        'Use parseUnknownAsString/parseUnknownAsNumber utilities from Phase 1.'
      );
    }

    // Component props recommendations
    if (errorsByCategory['component-props']?.length > 0) {
      recommendations.push(
        `⚛️ ${errorsByCategory['component-props'].length} component props errors detected. ` +
        'Fix props interface mismatches systematically.'
      );
    }

    // Critical files recommendations
    if (criticalFiles.length > 0) {
      recommendations.push(
        `🎯 Focus on critical files first: ${criticalFiles.slice(0, 3).join(', ')}... ` +
        'These have the highest error density.'
      );
    }

    return recommendations;
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private async saveDetailedReport(analysis: ErrorAnalysis): Promise<void> {
    const report = this.generateDetailedReport(analysis);
    await fs.writeFile('/root/video-ia.net/typescript-errors-analysis.md', report, 'utf-8');
    console.log('📄 Detailed report saved to: typescript-errors-analysis.md');
  }

  private generateDetailedReport(analysis: ErrorAnalysis): string {
    let report = `# 📊 TypeScript Errors Analysis Report\n\n`;
    report += `**Generated:** ${new Date().toLocaleString()}\n`;
    report += `**Total Errors:** ${analysis.totalErrors}\n\n`;

    // Summary by category
    report += `## 📋 Errors by Category\n\n`;
    Object.entries(analysis.errorsByCategory)
      .sort(([,a], [,b]) => b.length - a.length)
      .forEach(([category, errors]) => {
        report += `- **${category}**: ${errors.length} errors\n`;
      });

    // Critical files
    report += `\n## 🎯 Critical Files (Highest Priority)\n\n`;
    analysis.criticalFiles.forEach((file, index) => {
      const errorCount = analysis.errorsByFile[file]?.length || 0;
      report += `${index + 1}. **${file}** - ${errorCount} errors\n`;
    });

    // Recommendations
    report += `\n## 💡 Action Recommendations\n\n`;
    analysis.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n\n`;
    });

    // Detailed breakdown by category
    report += `\n## 🔍 Detailed Breakdown\n\n`;
    Object.entries(analysis.errorsByCategory).forEach(([category, errors]) => {
      report += `### ${category} (${errors.length} errors)\n\n`;
      
      // Show most common fix strategy for this category
      const strategies = errors.map(e => e.fixStrategy);
      const mostCommonStrategy = strategies.reduce((a, b, _, arr) => 
        arr.filter(s => s === a).length >= arr.filter(s => s === b).length ? a : b
      );
      report += `**Recommended fix strategy:** ${mostCommonStrategy}\n\n`;
      
      // Show sample errors
      const sampleErrors = errors.slice(0, 3);
      sampleErrors.forEach(error => {
        report += `- \`${error.file}:${error.line}\` - ${error.message.slice(0, 100)}${error.message.length > 100 ? '...' : ''}\n`;
      });
      
      if (errors.length > 3) {
        report += `- ... and ${errors.length - 3} more\n`;
      }
      report += `\n`;
    });

    return report;
  }

  printSummary(analysis: ErrorAnalysis): void {
    console.log('\n📊 TYPESCRIPT ERRORS ANALYSIS');
    console.log('='.repeat(50));
    console.log(`Total errors: ${analysis.totalErrors}`);
    console.log('\nTop categories:');
    Object.entries(analysis.errorsByCategory)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 5)
      .forEach(([category, errors]) => {
        console.log(`  ${category}: ${errors.length} errors`);
      });
    
    console.log('\nCritical files:');
    analysis.criticalFiles.slice(0, 5).forEach((file, i) => {
      const errorCount = analysis.errorsByFile[file]?.length || 0;
      console.log(`  ${i + 1}. ${file} (${errorCount} errors)`);
    });

    console.log('\nRecommendations:');
    analysis.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec.replace(/🔧|🛡️|⚛️|🎯/g, '').trim()}`);
    });
  }
}

// Execute analysis
if (require.main === module) {
  const analyzer = new TypeScriptErrorAnalyzer();
  analyzer.analyzeErrors()
    .then(analysis => {
      analyzer.printSummary(analysis);
      console.log('\n✅ Analysis complete! Check typescript-errors-analysis.md for details.');
    })
    .catch(error => {
      console.error('💥 Analysis failed:', error);
      process.exit(1);
    });
}

export { TypeScriptErrorAnalyzer };