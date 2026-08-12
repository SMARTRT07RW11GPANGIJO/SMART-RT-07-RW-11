# ADMIN ONBOARDING GUIDE

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-GUIDE-ONBOARDING` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## Welcome New Administrator!

Target Audience: Newly appointed System Administrators, Ketua RT, or Pengurus.  
Goal: Enable new administrators to manage, monitor, and operate SMART RT independently.

---

## 10-Step Administrator Onboarding Checklist

- [ ] **Step 1: Read System Overview & Architecture**
  - Read `00_overview` and `01_architecture` in System Documentation.
- [ ] **Step 2: Account Provisioning**
  - Receive account credentials from outgoing Administrator or Ketua RT.
- [ ] **Step 3: First Login & Security Setup**
  - Sign in to SMART RT, verify assigned `UserRole` (`ADMIN` or `KETUA_RT`), and change initial password immediately.
- [ ] **Step 4: Review RBAC Permissions**
  - Read `05_authorization` matrix to understand your privilege boundary.
- [ ] **Step 5: Inspect Control Center (9J)**
  - Open **Control Center (9J)** dashboard. Inspect System Health Score and verify 9 operational sub-services status.
- [ ] **Step 6: Practice Health Check & Ping All**
  - Execute manual **Ping All** health check in Control Center.
- [ ] **Step 7: Perform Backup & DR Test**
  - Run **Backup & Restore DR Test** in Control Center to verify snapshot generation and SHA-256 hash validation.
- [ ] **Step 8: Test Rita AI Assistant & DAL Security**
  - Interact with Rita AI Assistant. Test query filters to confirm PII masking for citizen data.
- [ ] **Step 9: Review Standard Operating Procedures (SOPs)**
  - Read `11_sop_admin` for letter approvals, financial recording, and complaint responses.
- [ ] **Step 10: Sign Onboarding Confirmation & Log Audit Entry**
  - Record onboarding completion in Audit Trail.
