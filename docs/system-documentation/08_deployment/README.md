# 08 — DEPLOYMENT DOCUMENTATION

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-08-DEPLOYMENT` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## 1. Environment & Build Configuration

- **Frontend SPA**: React 19 + Vite 6 + Tailwind CSS 4
- **Server Entry**: `server.ts` (Express 4.21 CJS Bundle)
- **Node.js Version**: Node 22 LTS
- **Build Command**: `npm run build` (`vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`)
- **Start Command**: `npm run start` (`node dist/server.cjs`)
- **Type Check Command**: `npm run lint` (`tsc --noEmit`)
- **Deployment Spec**: `vercel.json` (Vite framework rewrites)

---

## 2. Deployment Pipeline Flow

```text
Code Commit & Push
        │
        ▼
Dependency Check (`npm install`)
        │
        ▼
TypeScript Validation (`npm run lint`)
        │
        ▼
Production Build (`npm run build`)
        │
        ▼
Artifact Packaging (`dist/` & `dist/server.cjs`)
        │
        ▼
Deploy to Hosting Engine (Vercel / Cloud Run)
        │
        ▼
Execute Post-Deploy Smoke Test (Ping `/api/health`, PDF generation, WhatsApp, AI)
```

---

## 3. Pre-Flight & Post-Flight Checklist

- [x] All typescript types pass without errors (`npm run lint`)
- [x] Production build bundle completes without missing assets
- [x] Server environment variables set (`GEMINI_API_KEY`, `WHATSAPP_API_TOKEN`, `GAS_WEBAPP_URL`)
- [x] Public Vite variables configured (`VITE_GAS_WEBAPP_URL`, `VITE_APP_VERSION`)
- [x] Health ping endpoint `/api/health` returns `HTTP 200 OK`
- [x] QR Verification page accessible for public users
- [x] Control Center shows System Health Score >= 95
