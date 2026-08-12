# 00 — SYSTEM OVERVIEW

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-00-OVERVIEW` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## 1. System Metadata

- **System Name**: SMART RT 07 RW 11 GPA NGIJO
- **App Version**: `SMART RT v1.4.0`
- **AI Version**: `AI v1.2.0`
- **Knowledge Base Version**: `KB v1.2.0`
- **Prompt Version**: `PROMPT v1.4.0`
- **Release ID**: `REL-2026-008`
- **Status**: `PRODUCTION / ONLINE`
- **System Health Score**: `98 / 100`
- **Owner**: Pengurus RT 07 RW 11 Perum GPA Ngijo, Karangploso, Kabupaten Malang
- **Technical Lead**: System Administrator & DevOps RT

---

## 2. Technology Stack Inventory

| Layer | Component | Technology / Provider | Configuration / Details |
| :--- | :--- | :--- | :--- |
| **Frontend** | Single Page Application (SPA) | React 19 + TypeScript + Vite 6 + Tailwind CSS 4 | Port 3000, Vite SPA, Lucide Icons, Recharts, Motion |
| **Server Engine** | Express Node Server | Express 4.21 + tsx / esbuild (CJS) | Node 22, Port 3000, `dist/server.cjs` |
| **Database** | Primary Storage | Google Sheets (13 Isolated Worksheets) | Managed via Apps Script WebApp Router |
| **Backend API** | API Router & Execution | Google Apps Script (GAS) | WebApp Deployment (`doGet` / `doPost`) |
| **Vault & Files** | Digital Asset Storage | Google Drive Vault | 7 Protected Folders (Surat, PDF, Bukti, Backup) |
| **AI Engine** | GenAI Assistant & RAG | Google Gemini API (`@google/genai`) | Gemini Flash, DAL Guard, System Prompt v1.4.0 |
| **WhatsApp** | Notification & Gateway | WhatsApp Webhook & API Gateway | Session tokens, Exponential retry, Rate Limiting |
| **Hosting & CDN** | Production Deployment | Vercel Edge Cloud / Container Engine | Production build via `npm run build` |

---

## 3. Component Inventory Matrix

1. **Frontend UI**: `src/App.tsx`, `src/components/*` — Full UI tabs for Warga, Admin, Pengurus, Surat Generator, QR Verification, Audit, Control Center, and Rita AI Assistant.
2. **Express Backend**: `server.ts` — Proxies requests, provides static asset fallback, secures server-side Gemini & WA API keys.
3. **Google Apps Script (`gas-backend/`)**:
   - `Router`: Parses `action` parameters.
   - `DataAccess.gs`: Handles CRUD on Google Sheets.
   - `ResourceAccess.gs`: Enforces data access layer controls.
   - `Sanitizer.gs`: Prevents formula injection and XSS.
   - `AuditLog.gs`: Hash-chained audit trail writer.
   - `WhatsAppAI.gs` & `WhatsAppRouter.gs`: Webhook handlers for WhatsApp messages.
4. **Services Layer (`src/services/`)**:
   - `apiService.ts`: Communicates with Apps Script backend.
   - `aiAssistantService.ts`: Handles Rita AI Chat, tool calls, and RAG grounding.
   - `aiKnowledgeManagementService.ts`: Manages vector/text knowledge base.
   - `backupService.ts` & `backupVerificationService.ts`: Automates snapshots and restore tests.
   - `controlCenterService.ts`: Centralized command and control data layer.
   - `securityOperationsService.ts`: Threat detection and security testing runner.
   - `whatsappService.ts`: Message dispatch & status tracking.
