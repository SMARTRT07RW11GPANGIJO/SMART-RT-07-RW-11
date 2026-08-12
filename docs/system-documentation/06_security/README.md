# 06 — SECURITY DOCUMENTATION

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-06-SECURITY` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## 1. Security Architecture & Threat Protection

1. **Transport Layer Security**: Mandatory HTTPS for all web app traffic.
2. **Formula Injection Guard**: `Sanitizer.gs` strips leading `=`, `+`, `-`, `@` characters before writing to Google Sheets.
3. **Cross-Site Scripting (XSS)**: Inputs sanitized using HTML entity encoding.
4. **Prompt Injection Guard**: Server-side filter intercepts malicious instructions to Gemini API.
5. **Masked PII Protection**: NIK, KK, and Phone Numbers are masked in client views and exported files.

---

## 2. Data Classification Matrix

| Classification Level | Description | Examples | Handling & Storage Rules |
| :--- | :--- | :--- | :--- |
| **PUBLIC** | Information suitable for public view | RT Announcements, Public QR Verification Page | Unrestricted |
| **INTERNAL** | RT internal operational records | Agendas, General Work Programs | Authenticated users only |
| **CONFIDENTIAL** | Resident details & financial reports | Names, Addresses, Financial Statements | Pengurus, Ketua RT, Admin |
| **HIGHLY CONFIDENTIAL** | Sensitive PII & Audit Logs | Full NIK, KK Numbers, Hash-chained Audit Logs | Ketua RT & Admin Only (Masked for others) |
| **SECRET** | System keys & tokens | API Keys, DB Salts, Service Tokens | Environment Variables Only (`[REDACTED]`) |

---

## 3. Secret Management & Rotation Procedure

- Secrets MUST NEVER be committed to Git repositories.
- Environment variables template is documented in `.env.example`.
- Secrets rotation procedure:
  1. Generate new API token/key in cloud console.
  2. Update environment variable in Vercel / server host.
  3. Re-deploy application via `npm run build`.
  4. Perform smoke test on WhatsApp / AI / Database endpoints.
  5. Log secret rotation event to Audit Trail.

---

## 4. Security Incident Response Flow

```text
Detect Anomaly / Threat (Failed Logins / Security Block)
                    │
                    ▼
Investigate Incident (Check Security Operations Dashboard)
                    │
                    ▼
Contain Impact (Lock compromised account / Reset API token / Enable Maintenance)
                    │
                    ▼
Eradicate Vulnerability (Fix code / Update permissions)
                    │
                    ▼
Recover Service & Test Integrity
                    │
                    ▼
Log Incident Report & Update Documentation
```
