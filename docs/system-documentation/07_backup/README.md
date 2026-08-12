# 07 — BACKUP DOCUMENTATION

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-07-BACKUP` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## 1. Backup Strategy Overview

Integrates Tahap 6F, 6G, 9C & 9D. Daily snapshot backups protect Google Sheets databases, digital letter PDFs, Knowledge Base entries, and Audit Logs against data loss or corruption.

---

## 2. Backup Schedule & Inventory

| Backup Target | Source | Destination | Schedule | Retention | Verification Method | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Sheets DB** | 13 Worksheets | Folder `06_BACKUP` | Daily @ 06:00 WIB | 90 Days | SHA-256 Checksum | Admin & Pengurus |
| **Digital Letter PDFs** | Drive Folder `01_SURAT` | Folder `06_BACKUP/PDF` | Daily @ 06:00 WIB | 365 Days | File Count & Size Check | Admin |
| **AI Knowledge Base** | Vector/Text Store | Folder `06_BACKUP/KB` | Weekly | 180 Days | Integrity Hash | AI Admin |
| **Audit Trail Logs** | Worksheet `AuditLog` | Folder `06_BACKUP/AUDIT` | Daily @ 06:00 WIB | 365 Days | Hash Chain Validation | Admin & Ketua RT |

---

## 3. Automated Backup Verification Workflow

```text
Initiate Daily Backup Task
          │
          ▼
Create Google Sheets & Document Snapshot
          │
          ▼
Calculate SHA-256 Hash Checksum
          │
          ▼
Verify Size & Non-Zero Byte Validation
          │
          ▼
Execute Isolated Restore Simulation
          │
     ┌────┴────┐
     ▼         ▼
   PASS      FAIL
     │         │
     ▼         ▼
Log SUCCESS  Trigger CRITICAL Alert & Notify DevOps
```

---

## 4. Disaster Recovery Restore Procedure

1. **Identify Incident**: Confirm data loss or spreadsheet corruption.
2. **Enable Maintenance Mode**: Block citizen write operations in Control Center.
3. **Select Backup Snapshot**: Locate verified `.json` or Google Sheet backup in Drive `06_BACKUP`.
4. **Verify SHA-256 Checksum**: Ensure hash matches original snapshot manifest.
5. **Execute Restore Service**: Invoke `restoreService.ts` to populate clean database.
6. **Perform Smoke Test**: Verify resident records, active letters, and financial balances.
7. **Disable Maintenance Mode**: Resume public operations.
8. **Log Audit Event**: Document restore action in Audit Trail.
