# 01 — ARCHITECTURE DOCUMENTATION

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-01-ARCHITECTURE` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## 1. High-Level System Architecture Diagram

```text
                        ┌─────────────────────────────────────────────────────────┐
                        │              SMART RT USERS & CLIENTS                   │
                        │   Warga • Pengurus • Ketua RT • Admin • Public Viewer   │
                        └────────────────────────────┬────────────────────────────┘
                                                     │
                                                     ▼
                        ┌─────────────────────────────────────────────────────────┐
                        │             AUTHENTICATION & AUTHORIZATION              │
                        │    Login Guard • Role Verification • Session Expiry     │
                        └────────────────────────────┬────────────────────────────┘
                                                     │
                                                     ▼
                        ┌─────────────────────────────────────────────────────────┐
                        │                 REACT + VITE FRONTEND                   │
                        │         SPA Interface • TailWind CSS • Motion           │
                        └──────────────┬───────────────────────────┬──────────────┘
                                       │                           │
                                       ▼                           ▼
                        ┌──────────────────────────────┐ ┌─────────────────────────┐
                        │      EXPRESS NODE SERVER     │ │    RITA AI ENGINE &     │
                        │    (/api/* Proxy & Static)   │ │     KNOWLEDGE BASE      │
                        └──────────────┬───────────────┘ └────────────┬────────────┘
                                       │                              │
                                       ▼                              ▼
                        ┌──────────────────────────────┐ ┌─────────────────────────┐
                        │     GOOGLE APPS SCRIPT       │ │    AI DATA ACCESS LAYER │
                        │  (Router & Formula Guard)    │ │   (DAL Security Guard)  │
                        └──────────────┬───────────────┘ └────────────┬────────────┘
                                       │                              │
                                       ▼                              ▼
                        ┌──────────────────────────────┐ ┌─────────────────────────┐
                        │    GOOGLE SHEETS DATABASE    │ │    AI TOOLS REGISTRY    │
                        │   (13 Isolated Worksheets)   │ │  (Resident, Letter, etc)│
                        └──────────────┬───────────────┘ └─────────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │      GOOGLE DRIVE VAULT      │
                        │  (7 Protected System Folders)│
                        └──────────────┬───────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │      WHATSAPP GATEWAY        │
                        │    (Receipts & Reminders)    │
                        └──────────────────────────────┘
```

---

## 2. Core Architectural Flow Specifications

### A. General Application Data Flow
1. User interacts with React SPA UI components (`src/components/`).
2. Request passes through `AuthGuard` in `App.tsx` and role verification.
3. API call is initiated via `src/services/apiService.ts`.
4. Node Express server proxies request or sends GET/POST payload to Google Apps Script Endpoint (`VITE_GAS_WEBAPP_URL`).
5. Apps Script (`gas-backend/Router.gs`) sanitizes input using `Sanitizer.gs` to prevent formula injection (`=`, `@`, `+`, `-`).
6. Apps Script executes CRUD operation on target Google Sheets worksheet via `DataAccess.gs`.
7. Generated documents/PDFs are stored in specific Google Drive Vault folders.
8. Audit log entry is appended to Audit Trail Sheet with SHA-256 hash chaining.

### B. AI Engine & RAG Flow
1. User sends prompt via Rita AI Assistant interface (`RitaAssistantWidget.tsx`).
2. Prompt is evaluated by Server AI Security Guard for prompt injection/harmful input.
3. System Prompt (`PROMPT v1.4.0`) grounds Gemini Flash model.
4. AI Service retrieves context from Knowledge Base (`src/services/aiKnowledgeManagementService.ts`).
5. If data lookup or action is required, AI invokes structured tool calls via `aiDataAccessService.ts` (DAL).
6. DAL validates user's `UserRole` before returning filtered/masked data to Gemini.
7. Gemini generates response, which is logged to AI Audit Trail.

### C. WhatsApp Notification Flow
1. Transaction, letter approval, or system alert triggers `whatsappService.ts`.
2. Message payload is formatted with template signatures.
3. Payload is submitted to WhatsApp Gateway API using bearer token.
4. Gateway enqueues message with exponential retry backoff.
5. Message status callback updates notification status in Google Sheets.
