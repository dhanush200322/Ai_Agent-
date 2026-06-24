export interface TestCategoryResult {
  category: string;
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  executionTime: number;
}

export class EnterpriseTestRunner {
  results: TestCategoryResult[] = [];
  
  async runCategory(categoryName: string, tests: { name: string, fn: () => Promise<void> }[]): Promise<void> {
    console.log(`\n==================================`);
    console.log(`🏃 Running [${categoryName}] Tests`);
    console.log(`==================================`);
    
    let passed = 0;
    let failed = 0;
    let warnings = 0;
    const startTime = Date.now();
    
    for (const test of tests) {
      try {
        await test.fn();
        passed++;
        process.stdout.write('✅ ');
      } catch (e: any) {
        failed++;
        process.stdout.write('❌ ');
        console.error(`\n[FAIL] ${test.name}:`, e.message);
      }
    }
    
    console.log('\n');
    
    this.results.push({
      category: categoryName,
      total: tests.length,
      passed,
      failed,
      warnings,
      executionTime: Date.now() - startTime
    });
  }

  generateReport(): string {
    let report = `Enterprise Validation Report\n==================================\n\n`;
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;
    let totalTime = 0;
    
    for (const res of this.results) {
      const status = res.failed === 0 ? 'PASS' : 'FAIL';
      report += `${res.category}\n${status} ${res.passed}/${res.total}\n\n`;
      totalTests += res.total;
      totalPassed += res.passed;
      totalFailed += res.failed;
      totalWarnings += res.warnings;
      totalTime += res.executionTime;
    }
    
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0.00';
    
    report += `--------------------------------\n`;
    report += `Total Tests : ${totalTests}\n`;
    report += `Passed      : ${totalPassed}\n`;
    report += `Failed      : ${totalFailed}\n`;
    report += `Warnings    : ${totalWarnings}\n`;
    report += `Success     : ${successRate}%\n`;
    report += `Time        : ${totalTime}ms\n\n`;
    
    report += `Overall Status\n`;
    if (totalFailed === 0) {
      report += `🚀 ENTERPRISE PRODUCTION READY\n`;
    } else {
      report += `⚠️ SYSTEM FAILED VALIDATION\n`;
    }
    
    return report;
  }
}
