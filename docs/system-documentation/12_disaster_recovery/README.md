# 12 — DISASTER RECOVERY PLAN (DRP)

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-12-DISASTER-RECOVERY` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## 1. Disaster Recovery Metrics (RTO & RPO)

- **Recovery Time Objective (RTO)**: `< 30 Minutes` (Maximum acceptable downtime before service restoration).
- **Recovery Point Objective (RPO)**: `< 24 Hours` (Maximum acceptable data loss measured in time).

---

## 2. Emergency Disaster Scenarios & Response Runbooks

### Scenario A: Google Sheets Database Corruption or Deletion
- **Severity**: CRITICAL
- **Symptom**: Database reads fail with HTTP 500 or missing worksheets.
- **Action Steps**:
  1. Enable Maintenance Mode in Control Center (9J) to prevent new writes.
  2. Locate latest verified snapshot in Google Drive Folder `06_BACKUP`.
  3. Execute `restoreService.ts` to restore all 13 worksheets.
  4. Perform SHA-256 hash validation and data integrity check.
  5. Disable Maintenance Mode and verify resident access.

### Scenario B: Vercel Frontend / Hosting Down
- **Severity**: HIGH
- **Symptom**: Web domain unaccessible or returns 502/504 gateway error.
- **Action Steps**:
  1. Inspect Vercel / Cloud Run deployment logs.
  2. If build artifact corrupted, execute local build test: `npm run build`.
  3. Re-trigger deployment via Vercel CLI or GitHub push.
  4. Perform smoke test on `/api/health`.

### Scenario C: WhatsApp Gateway Unresponsive
- **Severity**: MEDIUM
- **Symptom**: Receipts and alert notifications fail to send.
- **Action Steps**:
  1. Check Control Center WhatsApp service badge status.
  2. Test gateway token via `/api/whatsapp/send` test ping.
  3. Re-issue API bearer token if expired.
  4. If provider down, system automatically queues messages for deferred delivery.

### Scenario D: Compromised Admin Credentials / Security Breach
- **Severity**: CRITICAL
- **Symptom**: Unauthorized administrative action logged in Audit Trail.
- **Action Steps**:
  1. Revoke all active sessions immediately via Control Center.
  2. Rotate `GEMINI_API_KEY`, `WHATSAPP_API_TOKEN`, and `GAS_SHARED_SECRET`.
  3. Reset passwords for all `ADMIN` and `KETUA_RT` accounts.
  4. Perform security audit scan via Security Operations Dashboard.
