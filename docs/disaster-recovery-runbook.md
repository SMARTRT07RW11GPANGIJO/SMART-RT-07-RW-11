# SMART RT 07 RW 11 PERUM GPA NGIJO
## DISASTER RECOVERY (DR) RUNBOOK — TAHAP 9D

**Document Version:** 1.0.0  
**Effective Date:** August 2026  
**Classification:** Internal Operational Security Procedure  

---

### 1. PURPOSE & SCOPE
Runbook ini mendefinisikan langkah-langkah operasional darurat dan prosedur pengujian berkala (DR Drill) untuk memastikan keberlangsungan sistem **SMART RT 07 RW 11 Perum GPA Ngijo**. Runbook ini mencakup mitigasi kegagalan pada:
- Database Google Sheets & GAS Web App API
- Vercel Frontend / Web Hosting
- Google Drive Document Storage & PDF Generation
- WhatsApp Gateway Notification Dispatch
- Security Credentials & API Tokens

---

### 2. INCIDENT & RECOVERY ROLES
| Role | Responsibility | Contact / Trigger |
| :--- | :--- | :--- |
| **INCIDENT COMMANDER** | Memimpin penanganan insiden, mengambil keputusan recovery, memverifikasi Go Live Gate | KETUA RT / ADMIN |
| **TECHNICAL LEAD (SRE)** | Mengeksekusi pipeline pemulihan, rollback deployment, dan pengalihan endpoint | DevOps Lead |
| **DATABASE RECOVERY** | Mengisolasi dataset, memverifikasi SHA-256 backup, merestore database | Database Admin |
| **SECURITY LEAD** | Melakukan verifikasi rotasi credential, audit RBAC, dan pencegahan eksploitasi | Security Engineer |
| **COMMUNICATION LEAD** | Mengelola notifikasi darurat internal pengurus dan pengumuman warga | Sekretaris RT |

---

### 3. RECOVERY LEVELS & TARGET METRICS
| Level | Severity | Example Event | Target RPO | Target RTO |
| :--- | :--- | :--- | :--- | :--- |
| **LEVEL 1** | Minor Incident | AI Assistant Error / Latency Spike | < 24 jam | < 1 jam |
| **LEVEL 2** | Service Failure | WhatsApp Gateway Down / PDF Drive Storage Error | < 12 jam | < 2 jam |
| **LEVEL 3** | Major Incident | Vercel Deployment Failure / GAS Web App Down | < 6 jam | < 3 jam |
| **LEVEL 4** | Disaster | Google Sheet Primary Database Lost / Compromised | < 1 jam | < 4 jam |

---

### 4. CORE RECOVERY PROCEDURE (10-STAGE PIPELINE)
1. **INCIDENT DECLARED**: Buat ID Insiden (`INC-YYYYMMDD-XXXX`) dan klasifikasikan Severity Level (Level 1 - 4).
2. **IDENTIFY**: Tentukan komponen yang tumbang (Database, Frontend, GAS, Drive, atau WhatsApp).
3. **CONTAINMENT**: Terapkan `STOP WRITE` pada API backend atau bekukan pipeline deployment untuk mencegah pemburukan data.
4. **ASSESS & BACKUP SELECTION**: Pilih snapshot backup terbaru dari **9C Backup Verification Engine** yang berstatus `PASS` (verified SHA-256 checksum).
5. **RESTORE (ISOLATED STAGING)**: Restore dataset ke temporary staging environment. Jangan pernah merestore langsung ke production tanpa verifikasi.
6. **DATA INTEGRITY VERIFICATION**: Validasi skema, record count, dan relasi antar 6 lembar data utama (WARGA, KELUARGA, SURAT, PENGADUAN, IURAN, AUDIT_LOG).
7. **SECURITY CHECK**: Verifikasi hak akses RBAC, kecocokan OAuth token, dan integritas sertifikat SSL TLS.
8. **SMOKE TEST (10 MODULES)**: Jalankan pengujian terisolasi pada 10 modul utama (Login, Dashboard, Data Warga, Surat, PDF, QR Verification, Pengaduan, Iuran, WhatsApp, AI).
9. **GO LIVE GATE APPROVAL**: Meminta persetujuan eksplisit dari Incident Commander (KETUA RT / ADMIN) sebelum mengarahkan traffic produksi.
10. **POST-MORTEM & ACTION ITEMS**: Catat RPO & RTO aktual, buat laporan DR Drill, dan assign action items dengan prioritas P0-P3.

---

### 5. SCENARIO LIBRARY (DR-001 THROUGH DR-010)
- **DR-001 (Google Sheet Lost)**: Contain writes -> Locate 9C verified backup -> Restore to new sheet -> Update GAS script property -> Smoke Test -> Go Live.
- **DR-002 (Vercel Down)**: Verify Git hash -> Rollback to last known-good build -> DNS check -> Smoke Test.
- **DR-003 (GAS Down)**: Isolate API Queue -> Deploy previous stable GAS deployment ID -> Test API endpoints.
- **DR-004 (Drive Failure)**: Verify Drive Service Account -> Restore folder structure from backup metadata -> Verify PDF & QR.
- **DR-005 (Database Corruption)**: Freeze DB -> Run 9C checksum validation -> Staging restore -> Schema audit -> Promote to prod.
- **DR-006 (WhatsApp Down)**: Disable retries -> Route urgent alerts to Email/Dashboard -> Reset Gateway Session -> Send test msg to RT board.
- **DR-007 (Credential Leak)**: Revoke leaked token -> Rotate API secrets in environment -> Redeploy -> Audit access log.
- **DR-008 (Bad Deployment)**: Freeze pipeline -> Instant Git tag rollback -> Full Smoke Test.
- **DR-009 (Document Loss)**: Locate missing PDF in 9C archive -> Restore PDF -> Validate QR Code reader.
- **DR-010 (Total Outage)**: Declare Level 4 Disaster -> Re-establish infrastructure -> Sequentially restore DB, Frontend, GAS, Drive, Notif -> Approval Gate -> Go Live.

---

### 6. EMERGENCY COMMUNICATION TEMPLATE
```
🚨 SMART RT DISASTER RECOVERY ALERT
Incident ID: INC-20260811-0001
Severity: LEVEL 4 (Primary Database Lost)
Status: RECOVERY IN PROGRESS (Stage: RESTORE)
Target RPO: 60 Minutes | Actual RPO: 12 Minutes
Target RTO: 240 Minutes | Actual RTO: 28 Minutes
Lead Commander: KETUA_RT (USR-KETUA_RT)
Action Required: Seluruh penulisan data warga ditahan sementara hingga Go Live Gate disetujui.
```
