// SMART RT 07 RW 11 GPA NGIJO - TAHAP 9K SYSTEM DOCUMENTATION SERVICE
// Centralized Technical & Operational System Documentation Data Layer

import { UserRole } from '../types/rt';
import { AuditLogger } from './auditLoggerService';

export interface DocumentationMetadata {
  docVersion: string;
  status: 'CURRENT' | 'DRAFT' | 'REVIEW' | 'ARCHIVED';
  lastUpdated: string;
  nextReview: string;
  coveragePercent: number;
  maintainer: string;
  totalModules: number;
}

export interface DocumentationSection {
  id: string; // e.g. '00_overview', '01_architecture', etc.
  number: string; // e.g. '00', '01', '02', 'GUIDE'
  title: string;
  category: 'CORE' | 'INFRASTRUCTURE' | 'SECURITY' | 'OPERATIONS' | 'GUIDE';
  summary: string;
  filePath: string;
  content: string;
  tags: string[];
}

export interface SopItem {
  code: string;
  title: string;
  pic: string;
  purpose: string;
  auditRequired: boolean;
}

export const SYSTEM_DOC_METADATA: DocumentationMetadata = {
  docVersion: 'DOC v1.0.0',
  status: 'CURRENT',
  lastUpdated: '2026-08-12',
  nextReview: '2026-11-12',
  coveragePercent: 98,
  maintainer: 'SMART RT System Administrator & DevOps Team',
  totalModules: 18
};

const SECTIONS_DATA: DocumentationSection[] = [
  {
    id: '00_overview',
    number: '00',
    title: 'System Overview & Inventory',
    category: 'CORE',
    summary: 'Metadatak sistem, versi komponen (v1.4.0), stack teknologi (React 19, Vite, Express, GAS, Sheets, Gemini Flash), dan inventarisasi komponen.',
    filePath: '/docs/system-documentation/00_overview/README.md',
    tags: ['overview', 'metadata', 'version', 'stack', 'inventory'],
    content: `# 00 — SYSTEM OVERVIEW\n\n**SMART RT 07 RW 11 PERUM GPA NGIJO**\n\n- System Version: SMART RT v1.4.0\n- AI Version: AI v1.2.0 | KB v1.2.0 | Prompt v1.4.0\n- Release ID: REL-2026-008\n- Frontend: React 19 + Vite 6 + Tailwind CSS 4\n- Server: Express Node Server (dist/server.cjs)\n- Database: Google Sheets (13 Isolated Worksheets)\n- Backend API: Google Apps Script WebApp Router\n- Storage Vault: Google Drive (7 Protected Folders)\n- AI Engine: Google Gemini API (@google/genai)\n- WhatsApp Gateway: Webhook API with exponential retry\n- Deployment: Vercel / Cloud Run Engine`
  },
  {
    id: '01_architecture',
    number: '01',
    title: 'System & Data Flow Architecture',
    category: 'INFRASTRUCTURE',
    summary: 'Diagram arsitektur end-to-end, alur data aplikasi, alur RAG AI, dan pipeline notifikasi WhatsApp Gateway.',
    filePath: '/docs/system-documentation/01_architecture/README.md',
    tags: ['architecture', 'diagram', 'flow', 'rag', 'express', 'gas'],
    content: `# 01 — ARCHITECTURE DOCUMENTATION\n\nUser -> AuthGuard -> React SPA -> Express Server -> Apps Script Router -> Google Sheets / Google Drive\n\nUser -> Rita AI -> Security Guard -> Gemini Flash -> DAL Permission Guard -> Knowledge Base / AI Tools`
  },
  {
    id: '02_database',
    number: '02',
    title: 'Database Schema & Logical ERD',
    category: 'INFRASTRUCTURE',
    summary: 'Spesifikasi 13 worksheet Google Sheets, skema relasi ERD, aturan sanitasi formula (=, +, -, @), dan aturan soft delete.',
    filePath: '/docs/system-documentation/02_database/README.md',
    tags: ['database', 'erd', 'sheets', 'schema', 'sanitizer', 'warga', 'surat', 'iuran'],
    content: `# 02 — DATABASE DOCUMENTATION\n\nPrimary DB: Google Sheets Spreadsheet Database via Apps Script (DataAccess.gs).\nWorksheets: Warga, KartuKeluarga, SuratPengantar, DigitalDocuments, TransaksiKeuangan, TagihanIuran, Pengaduan, AuditLog, etc.`
  },
  {
    id: '03_api',
    number: '03',
    title: 'API Reference (Express & Apps Script)',
    category: 'INFRASTRUCTURE',
    summary: 'Spesifikasi endpoint Express proxy (/api/health, /api/ai/chat, /api/whatsapp/send) dan router Google Apps Script.',
    filePath: '/docs/system-documentation/03_api/README.md',
    tags: ['api', 'endpoints', 'express', 'gas', 'health', 'chat', 'verify'],
    content: `# 03 — API DOCUMENTATION\n\nExpress Proxy: /api/health, /api/ai/chat, /api/whatsapp/send\nGAS Actions: ?action=ping, ?action=getResidents, ?action=createLetter, ?action=verifyDocument, ?action=getAuditLogs`
  },
  {
    id: '04_authentication',
    number: '04',
    title: 'Authentication & Session Security',
    category: 'SECURITY',
    summary: 'Mekanisme login, token sesi UUID v4, kebijakan kedaluwarsa sesi (8 jam), aturan penguncian akun (5x gagal), dan perlindungan kredensial.',
    filePath: '/docs/system-documentation/04_authentication/README.md',
    tags: ['authentication', 'login', 'session', 'lockout', 'tokens', 'password'],
    content: `# 04 — AUTHENTICATION DOCUMENTATION\n\nSession Duration: 8 Hours\nAccount Lockout: 5 Consecutive Failed Login Attempts -> 15 min lock\nBCrypt Password Hash & Strict No-Secrets-In-Repo Policy.`
  },
  {
    id: '05_authorization',
    number: '05',
    title: 'Authorization & RBAC Permission Matrix',
    category: 'SECURITY',
    summary: 'Matriks hak akses 5 peran (ADMIN, KETUA_RT, PENGURUS, WARGA, PUBLIC) dan aturan pengawal Data Access Layer (DAL).',
    filePath: '/docs/system-documentation/05_authorization/README.md',
    tags: ['authorization', 'rbac', 'roles', 'permissions', 'dal', 'guard'],
    content: `# 05 — AUTHORIZATION DOCUMENTATION\n\nRoles: ADMIN, KETUA_RT, PENGURUS, WARGA, PUBLIC.\nDAL Guard filters resident data according to user role (WARGA only sees own household data, PII masked for non-admins).`
  },
  {
    id: '06_security',
    number: '06',
    title: 'Security Protection & Secret Management',
    category: 'SECURITY',
    summary: 'Klasifikasi data (PUBLIC s/d SECRET), rotasi rahasia, pencegahan XSS/Formula Injection/Prompt Injection, dan penanganan insiden.',
    filePath: '/docs/system-documentation/06_security/README.md',
    tags: ['security', 'secrets', 'masking', 'xss', 'injection', 'incident'],
    content: `# 06 — SECURITY DOCUMENTATION\n\nData Classification: PUBLIC, INTERNAL, CONFIDENTIAL, HIGHLY CONFIDENTIAL, SECRET.\nSecret Masking: All tokens displayed as [REDACTED] or masked in UI.`
  },
  {
    id: '07_backup',
    number: '07',
    title: 'Backup Strategy & Restore Runbook',
    category: 'OPERATIONS',
    summary: 'Jadwal snapshot harian (06:00 WIB), verifikasi hash SHA-256, pengujian restore terisolasi (Tahap 6F/6G/9C), dan prosedur pemulihan.',
    filePath: '/docs/system-documentation/07_backup/README.md',
    tags: ['backup', 'restore', 'dr', 'sha256', 'snapshot', 'integrity'],
    content: `# 07 — BACKUP DOCUMENTATION\n\nDaily Snapshot at 06:00 WIB to Google Drive Folder 06_BACKUP.\nSHA-256 Hash Integrity Verification & Isolated Restore Test Simulation.`
  },
  {
    id: '08_deployment',
    number: '08',
    title: 'Deployment & Build Pipeline',
    category: 'OPERATIONS',
    summary: 'Spesifikasi build script (npm run build), Vercel SPA deployment, vercel.json, serta pre-flight dan post-flight checklist.',
    filePath: '/docs/system-documentation/08_deployment/README.md',
    tags: ['deployment', 'vercel', 'build', 'vite', 'esbuild', 'checklist'],
    content: `# 08 — DEPLOYMENT DOCUMENTATION\n\nBuild Pipeline: npm run lint && npm run build -> dist/server.cjs\nDeployment Target: Vercel / Cloud Run`
  },
  {
    id: '09_ai',
    number: '09',
    title: 'AI Engine, RAG & Knowledge Base',
    category: 'CORE',
    summary: 'Arsitektur Rita AI, Gemini Flash, Knowledge Base v1.2.0, RAG v1.2.0, DAL Security Guard, evaluasi kualitas, dan audit log AI.',
    filePath: '/docs/system-documentation/09_ai/README.md',
    tags: ['ai', 'gemini', 'rag', 'knowledge-base', 'dal', 'rita', 'tools'],
    content: `# 09 — AI DOCUMENTATION\n\nRita AI Engine: Gemini Flash, KB v1.2.0, RAG v1.2.0, System Prompt v1.4.0.\nDAL Security Guard prevents direct unmitigated DB reads.`
  },
  {
    id: '10_whatsapp',
    number: '10',
    title: 'WhatsApp Gateway & Automation',
    category: 'OPERATIONS',
    summary: 'Gateway notifikasi kuitansi iuran & persetujuan surat, webhook callback, rate limit (30 msg/min), dan matriks penyelesaian masalah.',
    filePath: '/docs/system-documentation/10_whatsapp/README.md',
    tags: ['whatsapp', 'gateway', 'webhook', 'notifications', 'receipts'],
    content: `# 10 — WHATSAPP DOCUMENTATION\n\nGateway Delivery: Receipts, Letter Approvals, Alerts.\nRate Limit: 30 msgs/min with Exponential Backoff Retry.`
  },
  {
    id: '11_sop_admin',
    number: '11',
    title: 'Standard Operating Procedures (15 SOPs)',
    category: 'OPERATIONS',
    summary: '15 SOP resmi operasional admin (Login, Kelola Warga, Surat, Keuangan, Backup, Restore, Security Incident, AI Update, Deployment).',
    filePath: '/docs/system-documentation/11_sop_admin/README.md',
    tags: ['sop', 'admin', 'procedures', 'guidelines', 'operations'],
    content: `# 11 — SOP ADMIN\n\n15 Core Standard Operating Procedures for SMART RT Administrators.`
  },
  {
    id: '12_disaster_recovery',
    number: '12',
    title: 'Disaster Recovery Plan (DRP & RTO/RPO)',
    category: 'OPERATIONS',
    summary: 'Target pemulihan RTO (< 30 menit) dan RPO (< 24 jam), serta skenario darurat (DB rusak, Vercel down, WA offline, kebocoran akun).',
    filePath: '/docs/system-documentation/12_disaster_recovery/README.md',
    tags: ['disaster-recovery', 'drp', 'rto', 'rpo', 'failover', 'emergencies'],
    content: `# 12 — DISASTER RECOVERY PLAN\n\nRTO < 30 Minutes | RPO < 24 Hours\nRunbooks for Database Corruption, Hosting Outage, Gateway Failure, and Security Breaches.`
  },
  {
    id: '13_troubleshooting',
    number: '13',
    title: 'Troubleshooting Knowledge Base',
    category: 'OPERATIONS',
    summary: 'Matriks diagnosa masalah login, database, pemuatan PDF, notifikasi WhatsApp, AI, dan hash mismatch audit log.',
    filePath: '/docs/system-documentation/13_troubleshooting/README.md',
    tags: ['troubleshooting', 'diagnostics', 'errors', 'fixes', 'solutions'],
    content: `# 13 — TROUBLESHOOTING\n\nDiagnostic Matrices & Step-by-Step Solutions for System Administrators.`
  },
  {
    id: '14_monitoring',
    number: '14',
    title: 'System Monitoring & Production Alerts',
    category: 'OPERATIONS',
    summary: 'Monitoring 9 sub-service (Tahap 9A/9B), ambang batas latensi, klasifikasi alert (CRITICAL, HIGH, MEDIUM, LOW), dan alur eskalasi.',
    filePath: '/docs/system-documentation/14_monitoring/README.md',
    tags: ['monitoring', 'alerts', 'health', 'latency', 'uptime', 'status'],
    content: `# 14 — MONITORING & ALERTS\n\nRealtime Health Monitoring across 9 Sub-Services with Alert Escalations.`
  },
  {
    id: '15_audit_compliance',
    number: '15',
    title: 'Audit Trail & Compliance Logging',
    category: 'SECURITY',
    summary: 'Pencatatan log audit terantai kriptografi SHA-256 (Tahap 6E), struktur data log, dan retensi 365 hari.',
    filePath: '/docs/system-documentation/15_audit_compliance/README.md',
    tags: ['audit', 'compliance', 'hash-chain', 'sha256', 'logs', 'retention'],
    content: `# 15 — AUDIT & COMPLIANCE\n\nHash-Chained Audit Logs (previousHash + currentHash SHA-256) Retained for 365 Days.`
  },
  {
    id: '16_release_management',
    number: '16',
    title: 'Release Management & Rollback',
    category: 'OPERATIONS',
    summary: 'Versi rilis aktif (REL-2026-008), penanganan komponen bersi (Tahap 9I), serta prosedur rollback instan.',
    filePath: '/docs/system-documentation/16_release_management/README.md',
    tags: ['release', 'rollback', 'versioning', 'deployment-pipeline'],
    content: `# 16 — RELEASE MANAGEMENT\n\nActive Release: REL-2026-008 | Instant Rollback Capabilities.`
  },
  {
    id: '17_changelog',
    number: '17',
    title: 'System Changelog (v1.0.0 s/d v1.4.0)',
    category: 'CORE',
    summary: 'Riwayat pembaruan sistem dari rilis perdana v1.0.0 hingga v1.4.0 (Tahap 9K System Documentation).',
    filePath: '/docs/system-documentation/17_changelog/README.md',
    tags: ['changelog', 'history', 'versions', 'updates', 'features'],
    content: `# 17 — SYSTEM CHANGELOG\n\nv1.4.0 (2026-08-12): Tahap 9K System Documentation & 9J Control Center.\nv1.3.0 (2026-08-10): Tahap 9A-9H AI Management & Security Operations.`
  },
  {
    id: 'guide_onboarding',
    number: 'GUIDE',
    title: 'Admin Onboarding Guide',
    category: 'GUIDE',
    summary: 'Panduan 10 langkah bagi administrator baru untuk menguasai operasional sistem secara mandiri.',
    filePath: '/docs/system-documentation/ADMIN_ONBOARDING.md',
    tags: ['onboarding', 'guide', 'admin', 'new-user', 'training'],
    content: `# ADMIN ONBOARDING GUIDE\n\n10-Step Setup Checklist for Newly Appointed System Administrators.`
  },
  {
    id: 'guide_offboarding',
    number: 'GUIDE',
    title: 'Admin Offboarding Guide',
    category: 'GUIDE',
    summary: 'Prosedur 8 langkah pencabutan akses, rotasi secret, dan transfer tanggung jawab administrator.',
    filePath: '/docs/system-documentation/ADMIN_OFFBOARDING.md',
    tags: ['offboarding', 'guide', 'security', 'revocation', 'secrets-rotation'],
    content: `# ADMIN OFFBOARDING GUIDE\n\n8-Step Access Revocation & Secrets Rotation Protocol.`
  },
  {
    id: 'guide_knowledge_transfer',
    number: 'GUIDE',
    title: 'Knowledge Transfer & Bus Factor Protection',
    category: 'GUIDE',
    summary: 'Rencana perlindungan "Bus Factor" dan penunjukkan admin cadangan agar sistem tidak pernah bergantung pada satu orang.',
    filePath: '/docs/system-documentation/KNOWLEDGE_TRANSFER.md',
    tags: ['bus-factor', 'knowledge-transfer', 'continuity', 'backup-admin'],
    content: `# KNOWLEDGE TRANSFER & BUS FACTOR PROTECTION PLAN\n\nEnsuring System Continuity Without Single Point of Human Failure.`
  },
  {
    id: 'guide_emergency_contacts',
    number: 'GUIDE',
    title: 'Emergency Contacts & Escalation Paths',
    category: 'GUIDE',
    summary: 'Daftar kontak eskalasi internal dan provider layanan saat terjadi insiden darurat.',
    filePath: '/docs/system-documentation/EMERGENCY_CONTACTS.md',
    tags: ['contacts', 'emergency', 'escalation', 'support'],
    content: `# EMERGENCY CONTACTS & ESCALATION PATHS\n\nEscalation Matrix for Critical Incidents.`
  }
];

export class SystemDocumentationService {
  /**
   * Get Metadata Info for Documentation Module
   */
  public static getMetadata(): DocumentationMetadata {
    return SYSTEM_DOC_METADATA;
  }

  /**
   * Get All Documentation Sections
   */
  public static getAllSections(): DocumentationSection[] {
    return SECTIONS_DATA;
  }

  /**
   * Get Section by ID
   */
  public static getSectionById(id: string): DocumentationSection | undefined {
    return SECTIONS_DATA.find((s) => s.id === id);
  }

  /**
   * Search Documentation by Keyword
   */
  public static searchDocumentation(query: string): DocumentationSection[] {
    if (!query || query.trim() === '') return SECTIONS_DATA;
    const q = query.toLowerCase().trim();

    return SECTIONS_DATA.filter(
      (section) =>
        section.title.toLowerCase().includes(q) ||
        section.summary.toLowerCase().includes(q) ||
        section.content.toLowerCase().includes(q) ||
        section.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  /**
   * Get Standard Operating Procedures List (SOPs)
   */
  public static getSopList(): SopItem[] {
    return [
      { code: 'SOP-ADM-001', title: 'Admin Login & Session Security', pic: 'Admin', purpose: 'Menjamin keamanan login admin', auditRequired: true },
      { code: 'SOP-ADM-002', title: 'Kelola Data Warga & Verifikasi', pic: 'Pengurus / Admin', purpose: 'Pengelolaan direktori warga & PII masking', auditRequired: true },
      { code: 'SOP-ADM-003', title: 'Digital Letter Verification & Approval', pic: 'Ketua RT / Admin', purpose: 'Verifikasi & persetujuan surat ber-QR Code', auditRequired: true },
      { code: 'SOP-ADM-004', title: 'Pencatatan Keuangan & Kuitansi WA', pic: 'Bendahara / Admin', purpose: 'Pencatatan kas & notifikasi kuitansi warga', auditRequired: true },
      { code: 'SOP-ADM-005', title: 'Penanganan Pengaduan Warga', pic: 'Pengurus RT', purpose: 'Tindak lanjut tiket pengaduan', auditRequired: true },
      { code: 'SOP-ADM-006', title: 'Automated Daily Backup & Integrity Check', pic: 'Admin / DevOps', purpose: 'Snapshot harian & verifikasi hash SHA-256', auditRequired: true },
      { code: 'SOP-ADM-007', title: 'Restorasi Database & Recovery Darurat', pic: 'Admin / DevOps', purpose: 'Prosedur pemulihan bencana', auditRequired: true },
      { code: 'SOP-ADM-008', title: 'Control Center System Health Check', pic: 'Admin / Ketua RT', purpose: 'Monitoring 9 sub-service & ping tes', auditRequired: true },
      { code: 'SOP-ADM-009', title: 'Security Incident & Threat Isolation', pic: 'Admin / DevOps', purpose: 'Penanganan ancaman keamanan', auditRequired: true },
      { code: 'SOP-ADM-010', title: 'AI Knowledge Base Maintenance', pic: 'AI Admin', purpose: 'Pembaruan KB & RAG AI Rita', auditRequired: true },
      { code: 'SOP-ADM-011', title: 'Mode Pemeliharaan Sistem (Maintenance)', pic: 'Admin / Ketua RT', purpose: 'Pengaktifan mode maintenance', auditRequired: true },
      { code: 'SOP-ADM-012', title: 'Rilis Versi & Rollback Otomatis', pic: 'Super Admin', purpose: 'Pengelolaan rilis versi & rollback', auditRequired: true },
      { code: 'SOP-ADM-013', title: 'Onboarding Admin Baru', pic: 'Ketua RT / Admin', purpose: 'Pelatihan & penyerahan akun admin baru', auditRequired: true },
      { code: 'SOP-ADM-014', title: 'Offboarding Admin & Revokasi Akses', pic: 'Ketua RT / Admin', purpose: 'Pencabutan akses & rotasi secret', auditRequired: true },
      { code: 'SOP-ADM-015', title: 'Disaster Recovery Drill Execution', pic: 'DevOps / Admin', purpose: 'Simulasi pemulihan bencana berkala', auditRequired: true }
    ];
  }

  /**
   * Log Documentation View Event to Audit Logger
   */
  public static logDocumentationView(sectionId: string, role: UserRole): void {
    AuditLogger.log({
      userId: 'ADMIN_DOCS_VIEWER',
      role,
      action: 'AI_AUTOMATION_COMPLETED',
      intent: 'VIEW_SYSTEM_DOCUMENTATION',
      status: 'SUCCESS',
      details: { sectionId }
    });
  }
}
