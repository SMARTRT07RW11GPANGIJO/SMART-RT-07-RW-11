# 05 — AUTHORIZATION DOCUMENTATION

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-05-AUTHORIZATION` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## 1. Role Definitions

- **`ADMIN`**: Technical System Administrator & Super User. Full system privileges.
- **`KETUA_RT`**: Executive Administrator. Final sign-off for digital letters, policy changes, and control center.
- **`PENGURUS`**: Operational Administrator. Manages finances, residents, complaints, and announcements.
- **`WARGA`**: Authenticated Resident. Submits letters, pays fees, files complaints, and views public/RT info.
- **`PUBLIC`**: Unauthenticated User. Can verify document authenticity via QR code and view public portal pages.

---

## 2. Role-Based Access Control (RBAC) Permission Matrix

| Feature / Module | ADMIN | KETUA_RT | PENGURUS | WARGA | PUBLIC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Public Landing Page & QR Verification** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Submit Letter Request / Complaint** | ✓ | ✓ | ✓ | ✓ (Own) | ✗ |
| **View Resident Directory** | ✓ (Full) | ✓ (Full) | ✓ (Full) | ✗ (Masked) | ✗ |
| **Approve Digital Letters** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Manage Financial Transactions** | ✓ | ✓ | ✓ | ✗ (Read) | ✗ |
| **View System Audit Logs (6E)** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Execute Backup & DR Test** | ✓ | ✓ | ✓ | ✗ | ✗ |
| **Control Center (9J)** | ✓ | ✓ | ✓ (Limited) | ✗ | ✗ |
| **Maintenance Mode Control** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Release Management & Rollback** | ✓ | ✗ | ✗ | ✗ | ✗ |

---

## 3. Data Access Layer (DAL) Security Guard Rules

Data Access Layer (`aiDataAccessService.ts` & `ResourceAccess.gs`) enforces resource filters:
1. `WARGA` query for residents returns ONLY their own household record.
2. `WARGA` query for letters returns ONLY letters where `id_warga` matches authenticated user.
3. `PENGURUS` query returns full resident data but masks sensitive NIK.
4. `ADMIN` and `KETUA_RT` queries return unmasked PII for official verification purposes.
