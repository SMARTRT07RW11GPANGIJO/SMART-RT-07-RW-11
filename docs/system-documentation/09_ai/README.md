# 09 — AI DOCUMENTATION

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-09-AI` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## 1. AI Assistant & RAG Engine Architecture

- **Assistant Name**: Rita (RT Intelligent Assistant)
- **AI Model**: Google Gemini Flash (`@google/genai` SDK)
- **AI Version**: `AI v1.2.0`
- **System Prompt**: `PROMPT v1.4.0`
- **Knowledge Base**: `KB v1.2.0`
- **RAG Engine**: `RAG v1.2.0`
- **Tools Suite**: `TOOLS v1.0.3`

---

## 2. AI Security & Data Access Layer (DAL) Enforcement

AI assistant MUST NEVER have direct, unmitigated SQL/Spreadsheet access.
All data retrievals pass through DAL Security Guard (`aiDataAccessService.ts`):

```text
User Query ──► Rita UI ──► AI Security Guard ──► Grounding Prompt + RAG KB
                                                      │
                                                      ▼
                                            Tool Execution Required?
                                                      │
                                            ┌─────────┴─────────┐
                                            ▼                   ▼
                                           YES                  NO
                                            │                   │
                                            ▼                   ▼
                                   DAL Permission Guard    Direct Answer
                                   (Filters by UserRole)
                                            │
                                            ▼
                                  Filtered Safe Data Payload
```

---

## 3. Knowledge Base Structure (`KB v1.2.0`)

1. **`AD_ART`**: Anggaran Dasar & Anggaran Rumah Tangga RT 07 RW 11.
2. **`SOP_LAYANAN`**: Prosedur pembuatan Surat Pengantar (KTP, KK, SKCK, Usaha, Kematian).
3. **`PERATURAN_LINGKUNGAN`**: Jam malam, aturan tamu wajib lapor 1x24 jam, jadwal kerja bakti, dan pengelolaan sampah.
4. **`IURAN_KEUANGAN`**: Tarif iuran bulanan (Kebersihan Rp25.000, Keamanan Rp20.000, Kas RT Rp10.000).
5. **`KONTAK_DARURAT`**: Nomor telepon penting (Ketua RT, Polsek Karangploso, Bhabinkamtibmas, Puskesmas, Pemadam Kebakaran).

---

## 4. AI Evaluation & Continuous Quality Control

- **Hallucination Rate Target**: `< 1%`
- **Latency Target**: `< 2000 ms`
- **Tools Execution Accuracy**: `> 98%`
- **User Feedback Rating**: `> 90% Positive`
- **Audit Logging**: All queries, prompt filters, tool invocations, and responses logged to `AIAuditLog`.
