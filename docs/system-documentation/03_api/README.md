# 03 — API DOCUMENTATION

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-03-API` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## 1. Overview & Base URLs

- **Client Environment Variable**: `VITE_GAS_WEBAPP_URL`
- **Server Environment Variable**: `GAS_WEBAPP_URL`
- **Protocol**: HTTPS GET / POST
- **Payload Format**: JSON
- **Shared Secret Header**: `X-GAS-SHARED-SECRET` or query parameter `secret`

---

## 2. Express Proxy Server Endpoints (`server.ts`)

### A. Health Ping
- **Method**: `GET`
- **Endpoint**: `/api/health`
- **Authentication**: None (Public)
- **Response**:
```json
{
  "status": "ok",
  "app": "SMART RT 07 RW 11",
  "version": "1.4.0",
  "timestamp": "2026-08-12T00:00:00.000Z"
}
```

### B. Gemini AI Chat Proxy
- **Method**: `POST`
- **Endpoint**: `/api/ai/chat`
- **Authentication**: Bearer Token / Session
- **Body Request**:
```json
{
  "prompt": "Bagaimana prosedur pengurusan Surat Pengantar KTP?",
  "userRole": "WARGA",
  "sessionId": "SESS-2026-9812"
}
```
- **Response**:
```json
{
  "status": "success",
  "response": "Untuk mengurus Surat Pengantar KTP, Anda dapat membuat pengajuan pada menu Surat Pengantar di aplikasi SMART RT...",
  "sources": ["KB-SOP-SURAT-001"],
  "model": "gemini-2.5-flash-rt"
}
```

### C. WhatsApp Notification Proxy
- **Method**: `POST`
- **Endpoint**: `/api/whatsapp/send`
- **Authentication**: Required (`ADMIN` or `SYSTEM`)
- **Body Request**:
```json
{
  "recipient": "081234567890",
  "message": "Terima kasih, iuran bulan Agustus 2026 telah diterima.",
  "type": "RECEIPT"
}
```

---

## 3. Google Apps Script WebApp Router (`gas-backend/Router.gs`)

All backend requests to Apps Script execute via `doGet(e)` or `doPost(e)`.

### Common Parameters
- `action`: Name of the backend action (e.g., `ping`, `getResidents`, `createLetter`, `verifyDocument`)
- `role`: Current user role (`ADMIN`, `KETUA_RT`, `PENGURUS`, `WARGA`, `PUBLIC`)
- `data`: JSON stringified payload

### Selected Active Action Endpoints

| Action Parameter | Method | Role Required | Purpose | Response |
| :--- | :--- | :--- | :--- | :--- |
| `?action=ping` | GET | PUBLIC | System ping & health check | `{ status: "ONLINE", timestamp: "..." }` |
| `?action=getResidents` | GET | PENGURUS+ | Retrieve resident list | `{ success: true, data: [...] }` |
| `?action=getLetters` | GET | WARGA (Own) / PENGURUS+ | Retrieve letter list | `{ success: true, data: [...] }` |
| `?action=createLetter` | POST | WARGA+ | Submit letter request | `{ success: true, id_surat: "SRT-..." }` |
| `?action=approveLetter` | POST | KETUA_RT / ADMIN | Approve & generate PDF | `{ success: true, pdfUrl: "..." }` |
| `?action=verifyDocument` | GET | PUBLIC | Verify document authenticity by QR token | `{ status: "VALID", document: {...} }` |
| `?action=getFinances` | GET | PENGURUS+ | Get financial transactions | `{ success: true, data: [...] }` |
| `?action=getAuditLogs` | GET | ADMIN / KETUA_RT | Retrieve hash-chained audit logs | `{ success: true, logs: [...] }` |

---

## 4. Error Handling Standard

```json
{
  "success": false,
  "error": "UNAUTHORIZED_ROLE_ACCESS",
  "message": "Akses ditolak: Peran WARGA tidak diizinkan mengubah status persetujuan.",
  "code": 403,
  "timestamp": "2026-08-12T00:00:00.000Z"
}
```
