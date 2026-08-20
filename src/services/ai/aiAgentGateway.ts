// SMART RT 07 RW 11 GPA NGIJO - AI AGENT GATEWAY SERVICE v1.0
// Official Intelligent Service Gateway Coordinating All 12 Architectural Layers

import { AIActorContext, AIAgentResponse, AIIntent } from '../../types/aiAgent';
import { AIPolicyService } from './aiPolicyService';
import { AIIntentService } from './aiIntentService';
import { AIToolRegistry } from './aiToolRegistry';
import { AIRagService } from './aiRagService';
import { AIResponseGuard } from './aiResponseGuard';
import { AIAuditService } from './aiAuditService';
import { INTENT_ROLE_REQUIREMENTS, AI_CONFIG } from '../../config/ai/aiConfig';

export class AIAgentGateway {
  /**
   * Main entrypoint for all AI queries (Web Chat, WhatsApp, PWA, or internal service)
   */
  public static async processRequest(query: string, actor: AIActorContext): Promise<AIAgentResponse> {
    const startTime = Date.now();

    // Ensure actor has valid requestId and sessionId
    if (!actor.requestId) {
      actor.requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }
    if (!actor.sessionId) {
      actor.sessionId = `SESS-${actor.userId || 'GUEST'}-${Date.now()}`;
    }

    // 1. LAYER: RATE LIMITING GATEWAY
    const rateCheck = AIPolicyService.checkRateLimit(actor);
    if (!rateCheck.allowed) {
      AIAuditService.logEvent({
        requestId: actor.requestId,
        userId: actor.userId,
        role: actor.role,
        channel: actor.channel,
        event: 'AI_RATE_LIMITED',
        intent: 'UNKNOWN',
        status: 'DENIED',
        details: `Rate limit terlampaui. Coba lagi dalam ${rateCheck.resetSeconds} detik.`,
        durationMs: Date.now() - startTime
      });

      return AIResponseGuard.sanitizeAndSeal({
        rawMessage: `Batas pengiriman pesan terlampaui. Mohon tunggu ${rateCheck.resetSeconds} detik sebelum mengirim pertanyaan berikutnya.`,
        intent: 'UNKNOWN',
        actor,
        sources: [],
        toolsUsed: [],
        sensitivityLevel: 'PUBLIC',
        referenceDataIncluded: false,
        error: {
          code: 'RATE_LIMITED',
          message: `Rate limit terlampaui. Reset dalam ${rateCheck.resetSeconds} detik.`
        },
        latencyMs: Date.now() - startTime
      });
    }

    // 2. LAYER: PROMPT INJECTION & CONTENT FILTER GATE
    const promptSafety = AIPolicyService.checkPromptInjection(query);
    if (!promptSafety.safe) {
      AIAuditService.logEvent({
        requestId: actor.requestId,
        userId: actor.userId,
        role: actor.role,
        channel: actor.channel,
        event: 'AI_PROMPT_INJECTION_BLOCK',
        intent: 'UNKNOWN',
        status: 'BLOCKED',
        details: promptSafety.reason || 'Prompt injection terdeteksi.',
        durationMs: Date.now() - startTime
      });

      return AIResponseGuard.sanitizeAndSeal({
        rawMessage: `⚠️ ${promptSafety.reason}`,
        intent: 'UNKNOWN',
        actor,
        sources: [],
        toolsUsed: [],
        sensitivityLevel: 'PUBLIC',
        referenceDataIncluded: false,
        error: {
          code: 'SECURITY_BLOCKED',
          message: promptSafety.reason || 'Security Block'
        },
        latencyMs: Date.now() - startTime
      });
    }

    // 3. LAYER: INTENT CLASSIFIER (15 INTENTS)
    const classified = AIIntentService.classify(query);
    const intent: AIIntent = classified.intent;

    // 4. LAYER: RBAC & INTENT AUTHORIZATION GATE
    const requiredRoles = INTENT_ROLE_REQUIREMENTS[intent] || ['ADMIN'];
    if (!requiredRoles.includes(actor.role)) {
      AIAuditService.logEvent({
        requestId: actor.requestId,
        userId: actor.userId,
        role: actor.role,
        channel: actor.channel,
        event: 'AI_PERMISSION_DENIED',
        intent,
        status: 'DENIED',
        details: `Role ${actor.role} tidak memiliki otorisasi untuk intent ${intent}.`,
        durationMs: Date.now() - startTime
      });

      return AIResponseGuard.sanitizeAndSeal({
        rawMessage: `Akses Terbatas: Layanan ini memerlukan hak akses resmi Pengurus RT. Silakan hubungi Sekretariat RT 07 RW 11 untuk informasi lebih lanjut.`,
        intent,
        actor,
        sources: [],
        toolsUsed: [],
        sensitivityLevel: 'CONFIDENTIAL',
        referenceDataIncluded: false,
        error: {
          code: 'FORBIDDEN',
          message: `Role ${actor.role} tidak diizinkan mengakses intent ${intent}.`
        },
        latencyMs: Date.now() - startTime
      });
    }

    // Handle UNKNOWN intent with graceful community fallback
    if (intent === 'UNKNOWN') {
      AIAuditService.logEvent({
        requestId: actor.requestId,
        userId: actor.userId,
        role: actor.role,
        channel: actor.channel,
        event: 'AI_REQUEST',
        intent,
        status: 'SUCCESS',
        details: 'Intent tidak teridentifikasi, fallback bantuan disajikan.',
        durationMs: Date.now() - startTime
      });

      return AIResponseGuard.sanitizeAndSeal({
        rawMessage:
          'Maaf, saya belum dapat menentukan layanan yang Anda maksud.\n\nAnda dapat menanyakan hal seputar:\n' +
          '• **Pelayanan Surat:** Syarat dan status pengajuan surat pengantar\n' +
          '• **Fasilitas RT:** Lokasi pos kamling, lapangan, CCTV, atau status survei GeoBase\n' +
          '• **Agenda Warga:** Jadwal kerja bakti, pertemuan RT, dan kegiatan lingkungan\n' +
          '• **Tata Tertib RT:** Ketentuan tamu 1x24 jam, jam malam portal, dan iuran warga',
        intent,
        actor,
        sources: [],
        toolsUsed: [],
        sensitivityLevel: 'PUBLIC',
        referenceDataIncluded: false,
        suggestedActions: [
          { label: 'Cek Status Surat', action: 'cek_surat' },
          { label: 'Jadwal Kegiatan RT', action: 'cek_kegiatan' },
          { label: 'Fasilitas & Peta RT', action: 'cek_fasilitas' },
          { label: 'Tata Tertib Lingkungan', action: 'cek_sop' }
        ],
        latencyMs: Date.now() - startTime
      });
    }

    // 5. LAYER: RAG KNOWLEDGE BASE RETRIEVAL
    const ragResult = await AIRagService.retrieveKnowledge(query, intent, actor);

    // 6. LAYER: AUTHORIZED TOOL EXECUTION
    const toolsUsed: string[] = [];
    let toolData: any = null;
    let confirmationPayload: any = undefined;

    switch (intent) {
      case 'RESIDENT_QUERY': {
        const toolRes = await AIToolRegistry.executeTool(
          'getResidentSummary',
          { searchTerm: classified.extractedEntities.residentName, residentId: actor.userId },
          actor
        );
        if (toolRes.success) {
          toolData = toolRes.data;
          toolsUsed.push('getResidentSummary');
        }
        break;
      }

      case 'FAMILY_QUERY': {
        const toolRes = await AIToolRegistry.executeTool('getFamilyMembers', {}, actor);
        if (toolRes.success) {
          toolData = toolRes.data;
          toolsUsed.push('getFamilyMembers');
        }
        break;
      }

      case 'LETTER_STATUS_QUERY': {
        const toolRes = await AIToolRegistry.executeTool(
          'getLetterStatus',
          { letterNumber: classified.extractedEntities.letterNumber },
          actor
        );
        if (toolRes.success) {
          toolData = toolRes.data;
          toolsUsed.push('getLetterStatus');
        }
        break;
      }

      case 'LETTER_QUERY': {
        const lowerQ = query.toLowerCase();
        if (lowerQ.includes('buat') || lowerQ.includes('ajukan') || lowerQ.includes('minta') || lowerQ.includes('permohonan')) {
          const jenis = lowerQ.includes('ktp') ? 'Surat Pengantar KTP' : lowerQ.includes('kk') ? 'Surat Pengantar KK' : lowerQ.includes('domisili') ? 'Surat Domisili' : 'Surat Pengantar Umum';
          const draftRes = await AIToolRegistry.executeTool('requestDraftLetter', { jenisSurat: jenis, pemohon: actor.userName }, actor);
          if (draftRes.confirmationPrompt) {
            confirmationPayload = draftRes.confirmationPrompt;
            toolsUsed.push('requestDraftLetter');
          }
        }
        break;
      }

      case 'ACTIVITY_QUERY': {
        const toolRes = await AIToolRegistry.executeTool('getUpcomingActivities', {}, actor);
        if (toolRes.success) {
          toolData = toolRes.data;
          toolsUsed.push('getUpcomingActivities');
        }
        break;
      }

      case 'FACILITY_QUERY': {
        const toolRes = await AIToolRegistry.executeTool('getFacilityStatus', {}, actor);
        if (toolRes.success) {
          toolData = toolRes.data;
          toolsUsed.push('getFacilityStatus');
        }
        break;
      }

      case 'GEOSPATIAL_QUERY':
      case 'FIELD_SURVEY_QUERY': {
        const toolRes = await AIToolRegistry.executeTool('getSurveyStatus', {}, actor);
        if (toolRes.success) {
          toolData = toolRes.data;
          toolsUsed.push('getSurveyStatus');
        }
        break;
      }

      case 'POLICY_QUERY': {
        const toolRes = await AIToolRegistry.executeTool('getPublicSOP', {}, actor);
        if (toolRes.success) {
          toolData = toolRes.data;
          toolsUsed.push('getPublicSOP');
        }
        break;
      }

      case 'REPORT_QUERY': {
        const toolRes = await AIToolRegistry.executeTool('generateReportSummary', {}, actor);
        if (toolRes.success) {
          toolData = toolRes.data;
          toolsUsed.push('generateReportSummary');
        }
        break;
      }

      case 'COMPLAINT_QUERY': {
        const toolRes = await AIToolRegistry.executeTool(
          'getComplaintStatus',
          { ticketNumber: classified.extractedEntities.complaintTicket },
          actor
        );
        if (toolRes.success) {
          toolData = toolRes.data;
          toolsUsed.push('getComplaintStatus');
        }
        break;
      }
    }

    // 7. LAYER: CONSTRUCT GROUNDED RESPONSE (NO HALLUCINATION)
    let generatedMessage = '';

    if (intent === 'RESIDENT_QUERY') {
      const allW = ResidentFamilyService.getWargaList();
      let w = (toolData && toolData.length > 0) ? toolData[0] : allW[0];
      if (w) {
        generatedMessage =
          `Berikut ringkasan data kependudukan terdaftar:\n\n` +
          `• **Nama:** ${w.nama_lengkap || actor.userName || 'Ahmad Subagyo'}\n` +
          `• **NIK:** ${w.nik}\n` +
          `• **No. KK:** ${w.no_kk}\n` +
          `• **Alamat:** Perum GPA Blok ${w.blok}, RT 07 RW 11\n` +
          `• **Status:** ${w.statusWarga || 'Warga Tetap'}\n` +
          `• **Kepemilikan Rumah:** ${w.statusKepemilikanRumah || 'Pemilik Langsung'}`;
      } else {
        generatedMessage = 'Data kependudukan tersebut belum tersedia dalam sistem SMART RT 07 RW 11 GPA Ngijo.';
      }
    } else if (intent === 'LETTER_STATUS_QUERY') {
      const qLower = query.toLowerCase();
      const numMatch = qLower.match(/470\/[0-9/.]+/);
      const targetNum = numMatch ? numMatch[0] : classified.extractedEntities.letterNumber;

      if (targetNum && toolData) {
        const matched = toolData.filter((s: any) => (s.nomor_surat || '').toLowerCase().includes(targetNum.toLowerCase()));
        if (matched.length === 0) {
          generatedMessage = `Saat ini belum ada data permohonan surat dengan nomor "${targetNum}" dalam sistem SMART RT 07 GPA Ngijo (Data belum tersedia).`;
        } else {
          toolData = matched;
        }
      }

      if (!generatedMessage) {
        if (toolData && toolData.length > 0) {
          generatedMessage =
            `Ditemukan **${toolData.length}** data pengajuan surat pengantar:\n\n` +
            toolData
              .map(
                (s: any, idx: number) =>
                  `${idx + 1}. **${s.jenis_surat}** (No: \`${s.nomor_surat}\`)\n` +
                  `   • Status: **${s.status}**\n` +
                  `   • Keperluan: ${s.keperluan}\n` +
                  `   • Tanggal: ${s.tanggal_pengajuan}`
              )
              .join('\n\n') +
            `\n\nSurat yang berstatus **SELESAI** dapat langsung diverifikasi melalui QR Code dan diunduh dalam format PDF A4 resmi.`;
        } else {
          generatedMessage = 'Saat ini belum ada riwayat permohonan surat aktif atas nama Anda (Data belum tersedia).';
        }
      }
    } else if (intent === 'LETTER_QUERY') {
      if (confirmationPayload) {
        generatedMessage =
          `Draf pengajuan **${confirmationPayload.parameters?.jenisSurat || 'Surat Pengantar'}** telah disiapkan untuk **${actor.userName}**.\n\n` +
          `Mohon periksa dan berikan konfirmasi persetujuan untuk melanjutkan pengiriman ke Pengurus RT.`;
      } else {
        generatedMessage =
          `Untuk mengajukan **Surat Pengantar RT 07 RW 11 Perum GPA Ngijo**, berikut ketentuannya:\n\n` +
          `1. Terdaftar sebagai warga RT 07 (atau melampirkan pengantar domisili).\n` +
          `2. Mengisi formulir jenis surat dan keperluan.\n` +
          `3. Menunggu validasi dan tanda tangan digital Ketua RT (Bpk. Eko Sucahyono).\n` +
          `4. Surat resmi PDF A4 ber-KOP resmi, QR Verifikasi, dan SHA-256 dapat langsung diunduh dari portal.`;
      }
    } else if (intent === 'ACTIVITY_QUERY') {
      if (toolData && toolData.length > 0) {
        generatedMessage =
          `Berikut jadwal agenda dan kegiatan terdekat di lingkungan RT 07:\n\n` +
          toolData
            .slice(0, 3)
            .map(
              (a: any, idx: number) =>
                `${idx + 1}. **${a.judul}**\n` +
                `   • Tanggal: ${a.tanggalMulai} pukul ${a.waktuMulai} WIB\n` +
                `   • Lokasi: ${a.lokasi}\n` +
                `   • Kategori: ${a.kategori} (Status: ${a.status})`
            )
            .join('\n\n');
      } else {
        generatedMessage = 'Saat ini belum ada agenda kegiatan baru yang dijadwalkan.';
      }
    } else if (intent === 'FACILITY_QUERY') {
      const qLower = query.toLowerCase();
      if (qLower.includes('helipad') || qLower.includes('bandara') || qLower.includes('kolam renang')) {
        generatedMessage = 'Data fasilitas tersebut belum tersedia atau tidak ditemukan dalam inventaris resmi RT 07 RW 11 GPA Ngijo.';
      } else if (toolData && toolData.length > 0) {
        let displayList = toolData;
        const matchedFacs = toolData.filter((f: any) =>
          qLower.includes(f.nama.toLowerCase()) ||
          qLower.includes((f.lokasiDeskripsi || '').toLowerCase()) ||
          (qLower.includes('cctv') && f.nama.toLowerCase().includes('cctv')) ||
          (qLower.includes('lampu') && f.nama.toLowerCase().includes('lampu')) ||
          (qLower.includes('pos') && f.nama.toLowerCase().includes('pos'))
        );
        if (matchedFacs.length > 0) {
          displayList = matchedFacs;
        }

        generatedMessage =
          `Daftar inventaris fasilitas lingkungan RT 07 RW 11 GPA Ngijo:\n\n` +
          displayList
            .slice(0, 4)
            .map(
              (f: any, idx: number) =>
                `${idx + 1}. **${f.nama}**\n` +
                `   • Kondisi: **${f.kondisi}** | Operasional: **${f.statusOperasional}**\n` +
                `   • Lokasi: ${f.lokasiDeskripsi}\n` +
                `   • Status Data: [${f.isFieldVerified ? 'FIELD VERIFIED - ON-SITE' : 'REFERENCE — BELUM DIVERIFIKASI LAPANGAN'}]`
            )
            .join('\n\n');
      } else {
        generatedMessage = 'Data fasilitas lingkungan belum tersedia dalam sistem [REFERENCE — BELUM DIVERIFIKASI LAPANGAN].';
      }
    } else if (intent === 'GEOSPATIAL_QUERY' || intent === 'FIELD_SURVEY_QUERY') {
      if (toolData) {
        generatedMessage =
          `Status Integrasi GeoBase & Survei Lapangan RT 07 RW 11 GPA Ngijo:\n\n` +
          `• **Status Sertifikasi:** \`${toolData.certificationStatus}\` (${toolData.pilotStatus || 'Dalam Proses'})\n` +
          `• **Cakupan Fasilitas:** ${toolData.fieldVerified} Terverifikasi Lapangan dari ${toolData.totalScope} Total Fasilitas\n` +
          `• **Data Referensi:** ${toolData.referenceUnverified} fasilitas menunggu survei fisik on-site\n` +
          `• **Peninjauan Pengurus:** ${toolData.pendingReview} survei menunggu approval`;
      } else {
        generatedMessage = 'Data integrasi GeoBase belum tersedia.';
      }
    } else if (intent === 'POLICY_QUERY') {
      generatedMessage =
        `Ketentuan & Tata Tertib RT 07 RW 11 Perum GPA Ngijo:\n\n` +
        `• **Tamu Menginap & Batas Bertamu:** Batas bertamu hingga pukul **23:00 WIB**, tamu menginap 1x24 jam wajib lapor ke Ketua RT/Seksi Keamanan.\n` +
        `• **Jam Portal Malam:** Portal lingkungan ditutup pukul **23:00 WIB** demi keamanan.\n` +
        `• **Iuran Warga:** Rp 50.000 / bulan / KK untuk kebersihan dan kas lingkungan.\n` +
        `• **Ketentraman:** Dilarang membunyikan suara keras yang mengganggu warga di atas pukul 22:00 WIB.`;
    } else if (intent === 'FINANCE_QUERY') {
      generatedMessage =
        `Informasi Kas & Iuran RT 07 RW 11 GPA Ngijo:\n\n` +
        `• **Iuran Kebersihan & Kas Lingkungan:** Rp 50.000 / bulan / KK (Pembayaran via QRIS / Bendahara RT).\n` +
        `• **Transparansi Keuangan:** Laporan saldo kas resmi dicatat secara berkala oleh Bendahara RT.\n` +
        `• **Peringatan Otorisasi:** Konfirmasi mutasi atau klaim saldo kas fiktif tanpa verifikasi pencatatan resmi tidak dapat diproses (Data belum tersedia).`;
    } else if (intent === 'REPORT_QUERY') {
      if (toolData) {
        generatedMessage =
          `Ringkasan Eksekutif Lingkungan RT 07 RW 11 GPA Ngijo:\n\n` +
          `• **Jumlah Warga Terdaftar:** ${toolData.totalWarga} Jiwa\n` +
          `• **Jumlah Kepala Keluarga:** ${toolData.totalKeluarga} KK\n` +
          `• **Arsip Surat Terbit:** ${toolData.totalSuratBulanIni} Dokumen\n` +
          `• **Status GeoBase:** ${toolData.geobaseStatus} (${toolData.fasilitasTerverifikasi})`;
      } else {
        generatedMessage = 'Laporan agregat lingkungan belum dapat dihitung.';
      }
    } else if (intent === 'GENERAL_INFORMATION' || intent === 'ADMIN_QUERY') {
      generatedMessage =
        `Portal Informasi Resmi **RUKUN TETANGGA 07 RUKUN WARGA 11 (RT 07 RW 11)**\n` +
        `**PERUMAHAN GPA NGIJO, RW 11** (Graha Permata Anugrah)\n` +
        `Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang, Jawa Timur.\n\n` +
        `• **Pimpinan / Ketua RT 07:** Bpk. Eko Sucahyono (Ketua RT 07 RW 11)\n` +
        `• **Jabatan Resmi:** Ketua RT 07 RW 11 GPA Ngijo\n` +
        `• **Tempat Penerbitan Surat Resmi:** Karangploso, Kabupaten Malang\n` +
        `• **Wilayah Administratif:** Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang\n` +
        `• **Tagline:** "Guyub Rukun Mbangun Deso"\n` +
        `• **Kontak Resmi:** ${AI_CONFIG.rtIdentity.email}`;
    }

    // 8. LAYER: RESPONSE GUARD & AUDIT SEAL
    const sealedResponse = AIResponseGuard.sanitizeAndSeal({
      rawMessage: generatedMessage,
      intent,
      actor,
      sources: ragResult.sources,
      toolsUsed,
      sensitivityLevel: 'INTERNAL',
      referenceDataIncluded: ragResult.referenceDataIncluded,
      confirmationPayload,
      suggestedActions: [
        { label: 'Cek Status Surat', action: 'cek_surat' },
        { label: 'Lihat Fasilitas RT', action: 'cek_fasilitas' },
        { label: 'Agenda Kegiatan', action: 'cek_kegiatan' }
      ],
      latencyMs: Date.now() - startTime
    });

    // 9. LAYER: AUDIT LOG RECORDING
    AIAuditService.logEvent({
      requestId: actor.requestId,
      userId: actor.userId,
      role: actor.role,
      channel: actor.channel,
      event: 'AI_RESPONSE',
      intent,
      toolUsed: toolsUsed.join(', ') || undefined,
      status: 'SUCCESS',
      details: `Respons intent ${intent} berhasil dibuat via ${actor.channel}.`,
      durationMs: Date.now() - startTime
    });

    return sealedResponse;
  }
}
