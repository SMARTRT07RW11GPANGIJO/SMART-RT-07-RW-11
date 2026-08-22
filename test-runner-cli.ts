// CLI Test Runner for SMART RT Acceptance Gates
import { WhatsAppTestRunnerService } from './src/services/whatsapp/whatsAppTestRunnerService';
import { AITestRunnerService } from './src/services/ai/aiTestRunnerService';
import { IdentityAuthTestService } from './src/services/identityAuthTestService';
import { IdentityE2ETestService } from './src/services/identityE2ETestService';
import { ActivityCalendarTestRunnerService } from './src/services/activityCalendarTestRunnerService';
import { FacilityTestRunnerService } from './src/services/facilityTestRunnerService';
import { FacilityMapTestRunnerService } from './src/services/facilityMapTestRunnerService';

async function main() {
  console.log('================================================================');
  console.log('  RUNNING SMART RT COMPREHENSIVE ACCEPTANCE & E2E TEST SUITE');
  console.log('================================================================\n');

  console.log('--- 1. RUNNING IDENTITY & KK LOGIN TESTS (AUTH-KK-001 -> AUTH-KK-037) ---');
  const authRes = await IdentityAuthTestService.runAllTests();
  console.log(`Identity Auth Tests: Total: ${authRes.total}, Passed: ${authRes.passed}, Failed: ${authRes.failed}, PassRate: ${authRes.passRatePercent}% (${authRes.durationMs}ms)`);

  if (authRes.failed > 0) {
    console.log('\n[!] FAILED IDENTITY AUTH TESTS:');
    authRes.results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`- ${r.testId} [${r.category}] ${r.name}`);
      console.log(`  Expected: ${r.expected}`);
      console.log(`  Actual:   ${r.actual}`);
    });
  }

  console.log('\n--- 2. RUNNING WHATSAPP ACCEPTANCE TESTS (WA-001 -> WA-039) ---');
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

  console.log('\n--- 3. RUNNING AI CORE ACCEPTANCE TESTS (AI-001 -> AI-050) ---');
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

  console.log('\n--- 4. RUNNING IDENTITY ACCOUNT PROVISIONING & E2E LOGIN GATE TESTS ---');
  const e2eRes = await IdentityE2ETestService.runAllE2ETests();
  console.log(`E2E Auth Tests: Total: ${e2eRes.total}, Passed: ${e2eRes.passed}, Failed: ${e2eRes.failed}, PassRate: ${e2eRes.passRatePercent}% (${e2eRes.durationMs}ms)`);

  if (e2eRes.failed > 0) {
    console.log('\n[!] FAILED E2E TESTS:');
    e2eRes.results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`- ${r.testId} [${r.category}] ${r.name}`);
      console.log(`  Expected: ${r.expected}`);
      console.log(`  Actual:   ${r.actual}`);
    });
  }

  console.log('\n--- 5. RUNNING RT ACTIVITY CALENDAR ACCEPTANCE TESTS (CR-SMART-RT-CALENDAR-001) ---');
  const calRes = await ActivityCalendarTestRunnerService.runAllTests();
  console.log(`Calendar Module Tests: Total: ${calRes.total}, Passed: ${calRes.passed}, Failed: ${calRes.failed}, PassRate: ${calRes.passRatePercent}% (${calRes.durationMs}ms)`);

  if (calRes.failed > 0) {
    console.log('\n[!] FAILED CALENDAR TESTS:');
    calRes.results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`- ${r.testId} [${r.category}] ${r.name}`);
      console.log(`  Expected: ${r.expected}`);
      console.log(`  Actual:   ${r.actual}`);
    });
  }

  console.log('\n--- 6. RUNNING SMART RT ENVIRONMENTAL FACILITY TESTS (CR-SMART-RT-FACILITY-001) ---');
  const facRes = await FacilityTestRunnerService.runAllTests();
  console.log(`Facility Module Tests: Total: ${facRes.total}, Passed: ${facRes.passed}, Failed: ${facRes.failed}, PassRate: ${facRes.passRatePercent}% (${facRes.durationMs}ms)`);

  if (facRes.failed > 0) {
    console.log('\n[!] FAILED FACILITY TESTS:');
    facRes.results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`- ${r.testId} [${r.category}] ${r.name}`);
      console.log(`  Expected: ${r.expected}`);
      console.log(`  Actual:   ${r.actual}`);
    });
  }

  console.log('\n--- 7. RUNNING SMART RT PETA FASILITAS RT TESTS (CR-SMART-RT-FACILITY-MAP-001) ---');
  const mapRes = await FacilityMapTestRunnerService.runAllTests();
  console.log(`Facility Map Tests: Total: ${mapRes.total}, Passed: ${mapRes.passed}, Failed: ${mapRes.failed}, PassRate: ${mapRes.passRatePercent}% (${mapRes.durationMs}ms)`);

  if (mapRes.failed > 0) {
    console.log('\n[!] FAILED FACILITY MAP TESTS:');
    mapRes.results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`- ${r.testId} [${r.category}] ${r.name}`);
      console.log(`  Expected: ${r.expected}`);
      console.log(`  Actual:   ${r.actual}`);
    });
  }

  const grandTotal = authRes.total + waRes.total + aiRes.total + e2eRes.total + calRes.total + facRes.total + mapRes.total;
  const grandPassed = authRes.passed + waRes.passed + aiRes.passed + e2eRes.passed + calRes.passed + facRes.passed + mapRes.passed;
  const grandFailed = authRes.failed + waRes.failed + aiRes.failed + e2eRes.failed + calRes.failed + facRes.failed + mapRes.failed;

  console.log('\n================================================================');
  if (grandFailed === 0) {
    console.log(`  ALL ACCEPTANCE GATES PASSED (100% SUCCESS RATE - ${grandPassed}/${grandTotal} TESTS)!`);
  } else {
    console.log(`  FAILURES DETECTED: Total Failed: ${grandFailed} (Auth: ${authRes.failed}, WA: ${waRes.failed}, AI: ${aiRes.failed}, E2E: ${e2eRes.failed}, Cal: ${calRes.failed}, Fac: ${facRes.failed}, Map: ${mapRes.failed})`);
  }
  console.log('================================================================');
}

main().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
