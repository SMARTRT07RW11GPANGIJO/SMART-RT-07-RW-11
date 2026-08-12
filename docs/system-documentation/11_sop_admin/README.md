# 11 — SOP ADMIN (STANDARD OPERATING PROCEDURES)

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-11-SOP` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## Index of Official Operational SOPs

1. `SOP-ADM-001`: Administrator Login & Session Security
2. `SOP-ADM-002`: Resident Data Management & Verification
3. `SOP-ADM-003`: Digital Letter Verification & Approval
4. `SOP-ADM-004`: Financial Recording & Fee Receipt Generation
5. `SOP-ADM-005`: Complaint Resolution & Resident Response
6. `SOP-ADM-006`: Automated Daily Backup & Integrity Check
7. `SOP-ADM-007`: Database Restoration & Emergency Recovery
8. `SOP-ADM-008`: Control Center Health Monitoring
9. `SOP-ADM-009`: Security Incident Response & Threat Isolation
10. `SOP-ADM-010`: AI Knowledge Base Update & Maintenance
11. `SOP-ADM-011`: System Maintenance Mode Operations
12. `SOP-ADM-012`: Software Release & Rollback Procedure
13. `SOP-ADM-013`: Admin Account Onboarding
14. `SOP-ADM-014`: Admin Account Offboarding & Access Revocation
15. `SOP-ADM-015`: Disaster Recovery Drill Execution

---

## Detailed Selected SOP Examples

### SOP-ADM-003: Digital Letter Verification & Approval
- **Code**: `SOP-ADM-003`
- **Purpose**: Verify citizen letter application details and issue official signed digital letter with QR code.
- **PIC**: Ketua RT / Admin
- **Steps**:
  1. Login to SMART RT Application with `KETUA_RT` or `ADMIN` role.
  2. Navigate to **Surat Pengantar** tab.
  3. Inspect pending applications (`DIAJUKAN`).
  4. Verify resident NIK, KK, and necessity against resident database.
  5. Click **Setujui & Generate PDF**.
  6. Application attaches cryptographic hash, QR verification token, and stores PDF in Google Drive Vault.
  7. Automated WhatsApp receipt sent to applicant.
- **Audit**: Action logged to `AuditLog` sheet.

---

### SOP-ADM-006: Automated Daily Backup & Integrity Check
- **Code**: `SOP-ADM-006`
- **Purpose**: Ensure 100% data durability through daily automated snapshots.
- **PIC**: Admin / DevOps
- **Steps**:
  1. Open **Control Center (9J)**.
  2. Select **Backup & Restore DR** sub-tab.
  3. Click **Run Backup & Test Restore**.
  4. Verify system creates spreadsheet snapshot in Drive `06_BACKUP`.
  5. Verify SHA-256 integrity hash status displays `VERIFIED`.
  6. Confirm isolated restore test displays `PASS`.
- **Audit**: Logged as `AI_AUTOMATION_COMPLETED` with backup size.
