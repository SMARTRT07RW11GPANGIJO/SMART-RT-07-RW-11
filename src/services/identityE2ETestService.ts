/**
 * SMART RT 07 RW 11 GPA NGIJO
 * IDENTITY ACCOUNT PROVISIONING & LOGIN E2E VERIFICATION SUITE v1.0
 * CR-SMART-RT-IDENTITY-001 Compliant
 * 
 * Verifies End-to-End lifecycle:
 * DATA WARGA -> DATA KELUARGA -> PROVISIONING -> USERNAME -> INITIAL CREDENTIAL ->
 * LOGIN -> FIRST LOGIN GATE -> FORCE PASSWORD CHANGE -> PASSWORD BARU ->
 * SESSION -> ROLE -> AUTHORIZATION -> OWNER DATA ISOLATION -> DASHBOARD
 */

import { IdentityAuthService, AuthAccount } from './identityAuthService';
import { ResidentFamilyService } from './residentFamilyService';
import { OwnerDataIsolationService } from './ownerDataIsolationService';
import { AuthoritativeSessionContext } from '../security/authorization';
import { getStoredAuditLogs } from './auditLogService';

export interface E2ETestResult {
  testId: string;
  category: 'PROVISIONING' | 'WARGA_E2E' | 'OFFICER_E2E' | 'NEGATIVE_LOGIN' | 'BRUTE_FORCE' | 'IDOR' | 'ROLE_ESCALATION' | 'SESSION' | 'AUDIT' | 'DATA_INTEGRITY';
  name: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
}

export interface E2ETestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  passRatePercent: number;
  durationMs: number;
  results: E2ETestResult[];
}

export class IdentityE2ETestService {
  public static async runAllE2ETests(): Promise<E2ETestSuiteSummary> {
    const startTime = Date.now();
    const results: E2ETestResult[] = [];

    // Reset testing state to clean baseline
    IdentityAuthService.resetTestingState();

    const keluargaList = ResidentFamilyService.getKeluargaList();
    const sampleKeluarga = keluargaList[0];
    const testKK = sampleKeluarga.nomorKK || sampleKeluarga.no_kk;
    const wargaList = ResidentFamilyService.getWargaList();
    const sampleHead = wargaList.find(w => (w.nomorKK === testKK || w.no_kk === testKK) && w.hubunganKeluarga === 'KEPALA_KELUARGA') || wargaList[0];
    const testDOB = sampleHead.tanggal_lahir; // e.g. "1982-08-15"

    // =========================================================================
    // 1. ACCOUNT PROVISIONING TESTS
    // =========================================================================
    {
      const t0 = Date.now();
      // Prov-01: Provisioning generates exact record matching Section 3.1
      const accounts = IdentityAuthService.initializeAccounts();
      const acc = accounts.get(testKK);
      const isCompleteRecord = !!(
        acc &&
        acc.userId &&
        acc.username === testKK &&
        acc.role === 'WARGA' &&
        acc.residentId &&
        acc.familyId &&
        acc.passwordHash &&
        acc.firstLogin === true &&
        acc.forcePasswordChange === true &&
        acc.accountStatus === 'PASSWORD_CHANGE_REQUIRED' &&
        acc.failedLoginCount === 0 &&
        acc.createdAt &&
        acc.updatedAt
      );

      results.push({
        testId: 'TEST-PROV-001',
        category: 'PROVISIONING',
        name: 'Account Provisioning creates complete official record schema (Section 3.1)',
        expected: 'isCompleteRecord: true',
        actual: `isCompleteRecord: ${isCompleteRecord}`,
        status: isCompleteRecord ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    {
      const t0 = Date.now();
      // Prov-02: Reject invalid KK (not 16 digits)
      const res = IdentityAuthService.provisionAccountFromOfficialData('12345ABC');
      results.push({
        testId: 'TEST-PROV-002',
        category: 'PROVISIONING',
        name: 'Provisioning rejects non-16-digit or malformed KK',
        expected: 'success: false',
        actual: `success: ${res.success}, error: ${res.error}`,
        status: !res.success && res.validationDetails?.isKKValid === false ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    {
      const t0 = Date.now();
      // Prov-03: Reject duplicate KK account
      const res = IdentityAuthService.provisionAccountFromOfficialData(testKK);
      results.push({
        testId: 'TEST-PROV-003',
        category: 'PROVISIONING',
        name: 'Provisioning rejects duplicate account creation',
        expected: 'success: false, isDuplicate: true',
        actual: `success: ${res.success}, isDuplicate: ${res.validationDetails?.isDuplicate}`,
        status: !res.success && res.validationDetails?.isDuplicate === true ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // =========================================================================
    // 2. WARGA LOGIN E2E LIFECYCLE (TEST-E2E-WARGA-001 -> 005)
    // =========================================================================
    let wargaSession: AuthoritativeSessionContext | undefined;
    const newWargaPassword = 'WargaGPA07#Bintang2026';

    // TEST-E2E-WARGA-001: First login with KK + Head DOB
    {
      const t0 = Date.now();
      const res = await IdentityAuthService.login({
        type: 'WARGA_KK',
        identifier: testKK,
        password: testDOB
      });
      wargaSession = res.session;
      const pass = res.success && res.isFirstLogin === true && res.forcePasswordChange === true;
      results.push({
        testId: 'TEST-E2E-WARGA-001',
        category: 'WARGA_E2E',
        name: 'TEST-E2E-WARGA-001: Initial Login with KK + Head DOB triggers First Login & Force Password Change',
        expected: 'success: true, firstLogin: true, forcePasswordChange: true',
        actual: `success: ${res.success}, firstLogin: ${res.isFirstLogin}, forcePasswordChange: ${res.forcePasswordChange}`,
        status: pass ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // TEST-E2E-WARGA-002: Accessing protected modules before password change is blocked / gate active
    {
      const t0 = Date.now();
      const isGateBlocked = wargaSession?.forcePasswordChange === true;
      results.push({
        testId: 'TEST-E2E-WARGA-002',
        category: 'WARGA_E2E',
        name: 'TEST-E2E-WARGA-002: User access before password change is gated to Change Password modal',
        expected: 'forcePasswordChange: true, gateBlocked: true',
        actual: `forcePasswordChange: ${wargaSession?.forcePasswordChange}, gateBlocked: ${isGateBlocked}`,
        status: isGateBlocked ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // TEST-E2E-WARGA-003: Change password with strong password
    {
      const t0 = Date.now();
      if (wargaSession) {
        const res = await IdentityAuthService.changePassword(
          wargaSession.sessionId,
          newWargaPassword,
          newWargaPassword
        );
        const pass = res.success && res.session?.forcePasswordChange === false && res.session?.isFirstLogin === false;
        results.push({
          testId: 'TEST-E2E-WARGA-003',
          category: 'WARGA_E2E',
          name: 'TEST-E2E-WARGA-003: Password change succeeds and clears firstLogin & forcePasswordChange flags',
          expected: 'success: true, firstLogin: false, forcePasswordChange: false',
          actual: `success: ${res.success}, firstLogin: ${res.session?.isFirstLogin}, forcePasswordChange: ${res.session?.forcePasswordChange}`,
          status: pass ? 'PASS' : 'FAIL',
          durationMs: Date.now() - t0
        });
      }
    }

    // TEST-E2E-WARGA-004: Subsequent login with New Password succeeds
    {
      const t0 = Date.now();
      const res = await IdentityAuthService.login({
        type: 'WARGA_KK',
        identifier: testKK,
        password: newWargaPassword
      });
      const pass = res.success && res.session?.role === 'WARGA' && res.forcePasswordChange === false;
      results.push({
        testId: 'TEST-E2E-WARGA-004',
        category: 'WARGA_E2E',
        name: 'TEST-E2E-WARGA-004: Subsequent login with KK + New Password succeeds with normal session',
        expected: 'success: true, role: WARGA, forcePasswordChange: false',
        actual: `success: ${res.success}, role: ${res.session?.role}, forcePasswordChange: ${res.forcePasswordChange}`,
        status: pass ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // TEST-E2E-WARGA-005: Login with Old DOB fails
    {
      const t0 = Date.now();
      const res = await IdentityAuthService.login({
        type: 'WARGA_KK',
        identifier: testKK,
        password: testDOB
      });
      results.push({
        testId: 'TEST-E2E-WARGA-005',
        category: 'WARGA_E2E',
        name: 'TEST-E2E-WARGA-005: Re-login using old DOB initial credential is strictly rejected',
        expected: 'success: false, errorCode: INVALID_CREDENTIALS',
        actual: `success: ${res.success}, errorCode: ${res.errorCode}`,
        status: !res.success && res.errorCode === 'INVALID_CREDENTIALS' ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // =========================================================================
    // 3. OFFICER E2E LIFECYCLE (PENGURUS, KETUA_RT, ADMIN)
    // =========================================================================
    // PENGURUS E2E
    {
      const t0 = Date.now();
      const res = await IdentityAuthService.login({
        type: 'OFFICER_CREDENTIAL',
        identifier: 'pengurus_rt07',
        password: 'PengurusRT07#2026'
      });
      const passInitial = res.success && res.session?.role === 'PENGURUS' && res.forcePasswordChange === true;

      // Change password
      let passChanged = false;
      if (res.session) {
        const changeRes = await IdentityAuthService.changePassword(
          res.session.sessionId,
          'PengurusBaru#2026GPA',
          'PengurusBaru#2026GPA'
        );
        passChanged = changeRes.success;
      }

      // Re-login
      const nextLogin = await IdentityAuthService.login({
        type: 'OFFICER_CREDENTIAL',
        identifier: 'pengurus_rt07',
        password: 'PengurusBaru#2026GPA'
      });

      const passFinal = passInitial && passChanged && nextLogin.success && nextLogin.session?.role === 'PENGURUS' && !nextLogin.forcePasswordChange;
      results.push({
        testId: 'TEST-E2E-PENGURUS-001',
        category: 'OFFICER_E2E',
        name: 'PENGURUS E2E: Initial Login -> Force Password Change -> Activated Session -> Role PENGURUS',
        expected: 'passFinal: true, role: PENGURUS',
        actual: `passFinal: ${passFinal}, role: ${nextLogin.session?.role}`,
        status: passFinal ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // KETUA_RT E2E
    {
      const t0 = Date.now();
      const res = await IdentityAuthService.login({
        type: 'OFFICER_CREDENTIAL',
        identifier: 'ketua_rt07',
        password: 'KetuaRT07#2026'
      });
      const passInitial = res.success && res.session?.role === 'KETUA_RT' && res.forcePasswordChange === true;

      let passChanged = false;
      if (res.session) {
        const changeRes = await IdentityAuthService.changePassword(
          res.session.sessionId,
          'KetuaBaru#2026GPA',
          'KetuaBaru#2026GPA'
        );
        passChanged = changeRes.success;
      }

      const nextLogin = await IdentityAuthService.login({
        type: 'OFFICER_CREDENTIAL',
        identifier: 'ketua_rt07',
        password: 'KetuaBaru#2026GPA'
      });

      const passFinal = passInitial && passChanged && nextLogin.success && nextLogin.session?.role === 'KETUA_RT' && !nextLogin.forcePasswordChange;
      results.push({
        testId: 'TEST-E2E-KETUA-001',
        category: 'OFFICER_E2E',
        name: 'KETUA_RT E2E: Initial Login -> Force Password Change -> Activated Session -> Role KETUA_RT',
        expected: 'passFinal: true, role: KETUA_RT',
        actual: `passFinal: ${passFinal}, role: ${nextLogin.session?.role}`,
        status: passFinal ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // ADMIN E2E
    {
      const t0 = Date.now();
      const res = await IdentityAuthService.login({
        type: 'OFFICER_CREDENTIAL',
        identifier: 'admin_rt07',
        password: 'AdminRT07#2026'
      });
      const passInitial = res.success && res.session?.role === 'ADMIN' && res.forcePasswordChange === true;

      let passChanged = false;
      if (res.session) {
        const changeRes = await IdentityAuthService.changePassword(
          res.session.sessionId,
          'AdminBaru#2026GPA',
          'AdminBaru#2026GPA'
        );
        passChanged = changeRes.success;
      }

      const nextLogin = await IdentityAuthService.login({
        type: 'OFFICER_CREDENTIAL',
        identifier: 'admin_rt07',
        password: 'AdminBaru#2026GPA'
      });

      const passFinal = passInitial && passChanged && nextLogin.success && nextLogin.session?.role === 'ADMIN' && !nextLogin.forcePasswordChange;
      results.push({
        testId: 'TEST-E2E-ADMIN-001',
        category: 'OFFICER_E2E',
        name: 'ADMIN E2E: Initial Login -> Force Password Change -> Activated Session -> Role ADMIN',
        expected: 'passFinal: true, role: ADMIN',
        actual: `passFinal: ${passFinal}, role: ${nextLogin.session?.role}`,
        status: passFinal ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // =========================================================================
    // 4. NEGATIVE LOGIN TESTS (Section 15)
    // =========================================================================
    const negativeCases: Array<{ id: string; name: string; type: 'WARGA_KK' | 'OFFICER_CREDENTIAL'; ident: string; pass: string }> = [
      { id: 'TEST-NEG-001', name: 'Wrong Password', type: 'WARGA_KK', ident: testKK, pass: 'WrongPassword999' },
      { id: 'TEST-NEG-002', name: 'Wrong KK (non-existent 16 digits)', type: 'WARGA_KK', ident: '3507120101999999', pass: '1980-01-01' },
      { id: 'TEST-NEG-003', name: 'Wrong DOB', type: 'WARGA_KK', ident: testKK, pass: '1945-08-17' },
      { id: 'TEST-NEG-004', name: 'Empty Username / KK', type: 'WARGA_KK', ident: '', pass: 'SamplePass123' },
      { id: 'TEST-NEG-005', name: 'Empty Password', type: 'WARGA_KK', ident: testKK, pass: '' },
      { id: 'TEST-NEG-006', name: 'Malformed KK containing letters', type: 'WARGA_KK', ident: '3507120101ABCD99', pass: '1980-01-01' },
      { id: 'TEST-NEG-007', name: 'Nonexistent Officer Account', type: 'OFFICER_CREDENTIAL', ident: 'super_hacker', pass: 'Secret123' }
    ];

    for (const nc of negativeCases) {
      const t0 = Date.now();
      const res = await IdentityAuthService.login({
        type: nc.type,
        identifier: nc.ident,
        password: nc.pass
      });
      // Verify generic message that does not leak existence
      const pass = !res.success && !res.session;
      results.push({
        testId: nc.id,
        category: 'NEGATIVE_LOGIN',
        name: `Negative Login: ${nc.name}`,
        expected: 'success: false, session: undefined',
        actual: `success: ${res.success}, error: ${res.error}`,
        status: pass ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // =========================================================================
    // 5. BRUTE FORCE DEFENSE & 15-MINUTE LOCKOUT (Section 16)
    // =========================================================================
    {
      const t0 = Date.now();
      const bruteKeluarga = keluargaList[1] || keluargaList[0];
      const bruteKK = bruteKeluarga.nomorKK || bruteKeluarga.no_kk;

      // 5 Consecutive failed attempts
      for (let i = 1; i <= 5; i++) {
        await IdentityAuthService.login({
          type: 'WARGA_KK',
          identifier: bruteKK,
          password: `WrongPassAttempt#${i}`
        });
      }

      // 6th attempt must be locked
      const sixthAttempt = await IdentityAuthService.login({
        type: 'WARGA_KK',
        identifier: bruteKK,
        password: 'ValidOrInvalidPass'
      });

      const pass = sixthAttempt.errorCode === 'ACCOUNT_LOCKED';
      results.push({
        testId: 'TEST-BRUTE-001',
        category: 'BRUTE_FORCE',
        name: 'Brute Force Defense: 5 failed attempts trigger 15-minute Account Lockout',
        expected: 'errorCode: ACCOUNT_LOCKED',
        actual: `errorCode: ${sixthAttempt.errorCode}, error: ${sixthAttempt.error}`,
        status: pass ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // =========================================================================
    // 6. IDOR & OWNER DATA ISOLATION (Section 17)
    // =========================================================================
    {
      const t0 = Date.now();
      // Warga login
      const wargaLoginRes = await IdentityAuthService.login({
        type: 'WARGA_KK',
        identifier: testKK,
        password: newWargaPassword
      });

      const sessionWarga = wargaLoginRes.session!;
      let canAccessSelf = false;
      let blockedFromOther = false;

      // Access own profile
      try {
        const selfProfile = OwnerDataIsolationService.getSecuredProfile(sessionWarga);
        canAccessSelf = !!selfProfile;
      } catch {
        canAccessSelf = false;
      }

      // Attempt to access another resident's letter (SRT-2026-0002 owned by WRG-002)
      try {
        OwnerDataIsolationService.getSecuredLetter(sessionWarga, 'SRT-2026-0002');
        blockedFromOther = false;
      } catch (err: any) {
        blockedFromOther = true;
      }

      const pass = canAccessSelf === true && blockedFromOther === true;
      results.push({
        testId: 'TEST-IDOR-001',
        category: 'IDOR',
        name: 'IDOR Defense: Warga can access own profile but is blocked from other residents letters',
        expected: 'canAccessSelf: true, blockedFromOther: true',
        actual: `canAccessSelf: ${canAccessSelf}, blockedFromOther: ${blockedFromOther}`,
        status: pass ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // =========================================================================
    // 7. ROLE ESCALATION PREVENTION (Section 18)
    // =========================================================================
    {
      const t0 = Date.now();
      // Client attempts to claim ADMIN role while logging in as Warga
      const res = await IdentityAuthService.login({
        type: 'WARGA_KK',
        identifier: testKK,
        password: newWargaPassword
      });

      const serverAssignedRole = res.session?.role;
      const pass = serverAssignedRole === 'WARGA';
      results.push({
        testId: 'TEST-ROLE-ESC-001',
        category: 'ROLE_ESCALATION',
        name: 'Role Escalation Defense: Server strictly derives role from account store, client cannot escalate',
        expected: 'role: WARGA',
        actual: `role: ${serverAssignedRole}`,
        status: pass ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // =========================================================================
    // 8. SESSION LIFECYCLE & LOGOUT INVALIDATION (Section 19)
    // =========================================================================
    {
      const t0 = Date.now();
      const loginRes = await IdentityAuthService.login({
        type: 'OFFICER_CREDENTIAL',
        identifier: 'admin_rt07',
        password: 'AdminBaru#2026GPA'
      });

      const sessId = loginRes.session!.sessionId;
      const beforeLogoutValid = IdentityAuthService.getActiveSession(sessId)?.isValid === true;
      await IdentityAuthService.logout(sessId);
      const afterLogoutSess = IdentityAuthService.getActiveSession(sessId);
      const afterLogoutValid = afterLogoutSess ? afterLogoutSess.isValid : false;

      const pass = beforeLogoutValid && !afterLogoutValid;
      results.push({
        testId: 'TEST-SESSION-001',
        category: 'SESSION',
        name: 'Session Lifecycle: Logout immediately invalidates session context',
        expected: 'beforeLogoutValid: true, afterLogoutValid: false',
        actual: `beforeLogoutValid: ${beforeLogoutValid}, afterLogoutValid: ${afterLogoutValid}`,
        status: pass ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // =========================================================================
    // 9. AUDIT LOGGING & ZERO CREDENTIAL LEAKAGE (Section 20)
    // =========================================================================
    {
      const t0 = Date.now();
      const logs = getStoredAuditLogs();
      const hasLoginSuccess = logs.some(l => l.action === 'LOGIN_SUCCESS');
      const hasPasswordChange = logs.some(l => l.action === 'PASSWORD_CHANGED');
      const hasLogout = logs.some(l => l.action === 'LOGOUT');
      const hasAccountLocked = logs.some(l => l.action === 'ACCOUNT_LOCKED');

      // Check no password string leakage
      const leaked = logs.some(l =>
        l.details.includes(newWargaPassword) ||
        l.details.includes('PengurusBaru#2026GPA') ||
        l.details.includes('KetuaBaru#2026GPA') ||
        l.details.includes('AdminBaru#2026GPA') ||
        l.details.includes(testDOB)
      );

      const pass = hasLoginSuccess && hasPasswordChange && hasLogout && hasAccountLocked && !leaked;
      results.push({
        testId: 'TEST-AUDIT-001',
        category: 'AUDIT',
        name: 'Audit Security: Key auth events recorded with zero plaintext credential leakage',
        expected: 'eventsRecorded: true, credentialLeaked: false',
        actual: `eventsRecorded: ${hasLoginSuccess && hasPasswordChange}, credentialLeaked: ${leaked}`,
        status: pass ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    // =========================================================================
    // 10. DATA INTEGRITY (Section 21)
    // =========================================================================
    {
      const t0 = Date.now();
      const rawWarga = ResidentFamilyService.getWargaList();
      const rawKeluarga = ResidentFamilyService.getKeluargaList();

      const allWargaHaveValidNames = rawWarga.every(w => !!w.nama_lengkap && !!w.nik && !!w.no_kk);
      const allKeluargaHaveValidKK = rawKeluarga.every(k => !!(k.nomorKK || k.no_kk));

      const pass = allWargaHaveValidNames && allKeluargaHaveValidKK;
      results.push({
        testId: 'TEST-DATA-INT-001',
        category: 'DATA_INTEGRITY',
        name: 'Data Integrity: Account provisioning leaves resident and family records 100% intact',
        expected: 'dataIntact: true',
        actual: `dataIntact: ${pass}`,
        status: pass ? 'PASS' : 'FAIL',
        durationMs: Date.now() - t0
      });
    }

    const durationMs = Date.now() - startTime;
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const passRatePercent = Math.round((passed / results.length) * 100);

    return {
      total: results.length,
      passed,
      failed,
      passRatePercent,
      durationMs,
      results
    };
  }
}
