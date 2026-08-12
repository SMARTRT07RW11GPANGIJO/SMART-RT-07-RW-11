# 13 — TROUBLESHOOTING KNOWLEDGE BASE

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-13-TROUBLESHOOTING` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## Troubleshooting Diagnostic Matrix

| Problem Category | Observed Symptom | Possible Cause | Diagnostic Procedure | Solution / Fix |
| :--- | :--- | :--- | :--- | :--- |
| **Login Failure** | "Kredensial Tidak Valid" | Incorrect password or account locked | Check `failedLogin` count in Control Center (9J) | Reset password or wait 15 min for lockout expiry |
| **Database Read Error** | "Gagal Memuat Data Warga" | Apps Script quota exceeded or URL mismatch | Check `VITE_GAS_WEBAPP_URL` in `.env` and GAS logs | Re-deploy Apps Script WebApp & update URL |
| **PDF Generation Failure** | "PDF Tidak Dapat Dibuat" | Drive Folder permissions or GAS memory | Inspect Drive folder `01_SURAT` write access | Grant Editor access to Apps Script execution account |
| **WhatsApp Delivery Failed** | "Pesan Terhenti di Queue" | Token expired or rate limit hit | Test token ping in Control Center Security tab | Rotate `WHATSAPP_API_TOKEN` & restart worker |
| **AI Assistant Error** | "Rita AI Tidak Merespon" | Gemini API Key missing or quota exceeded | Check `GEMINI_API_KEY` in server environment | Verify Gemini API Key quota and model string |
| **Audit Log Hash Mismatch** | "Integrity Violation Alert" | Direct manual edit in Google Sheets | Run Audit Integrity Verification (`auditIntegrityService.ts`) | Re-hash log entry and lock sheet editing rights |
