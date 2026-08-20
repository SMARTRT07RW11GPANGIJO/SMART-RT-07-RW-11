// CLI Test Runner for SMART RT Acceptance Gates
import { WhatsAppTestRunnerService } from './src/services/whatsapp/whatsAppTestRunnerService';
import { AITestRunnerService } from './src/services/ai/aiTestRunnerService';

async function main() {
  console.log('================================================================');
  console.log('  RUNNING SMART RT AI AGENT + WHATSAPP ACCEPTANCE TEST SUITE');
  console.log('================================================================\n');

  console.log('--- 1. RUNNING WHATSAPP ACCEPTANCE TESTS (WA-001 -> WA-039) ---');
  const waRes = await WhatsAppTestRunnerService.runAllTests();
  console.log(`WhatsApp Tests: Total: ${waRes.total}, Passed: ${waRes.passed}, Failed: ${waRes.failed}, PassRate: ${waRes.passRatePercent}% (${waRes.durationMs}ms)`);

  if (waRes.failed > 0) {
    console.log('\n[!] FAILED WHATSAPP TESTS:');
    waRes.results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`- ${r.testId} [${r.category}] ${r.name}: ${r.message}`);
      console.log(`  Expected: ${r.expected}`);
      console.log(`  Actual:   ${r.actual}`);
    });
  }

  console.log('\n--- 2. RUNNING AI CORE ACCEPTANCE TESTS (AI-001 -> AI-050) ---');
  const aiRes = await AITestRunnerService.runAllTests();
  console.log(`AI Core Tests: Total: ${aiRes.total}, Passed: ${aiRes.passed}, Failed: ${aiRes.failed}, PassRate: ${aiRes.passRatePercent}% (${aiRes.durationMs}ms)`);

  if (aiRes.failed > 0) {
    console.log('\n[!] FAILED AI CORE TESTS:');
    aiRes.results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`- ${r.testId} [${r.category}] ${r.name}: ${r.message}`);
      console.log(`  Expected: ${r.expected}`);
      console.log(`  Actual:   ${r.actual}`);
    });
  }

  console.log('\n================================================================');
  if (waRes.failed === 0 && aiRes.failed === 0) {
    console.log('  ALL ACCEPTANCE GATES PASSED (100% SUCCESS RATE)!');
  } else {
    console.log(`  FAILURES DETECTED: WA (${waRes.failed}), AI (${aiRes.failed})`);
  }
  console.log('================================================================');
}

main().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
