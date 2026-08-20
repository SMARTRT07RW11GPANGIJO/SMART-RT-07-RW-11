// SMART RT 07 RW 11 GPA NGIJO - AI TOOL REGISTRY v1.0
// Authoritative Tool Registry & Single-Source-of-Truth Dispatcher

import { UserRole } from '../../types/rt';
import { AIToolDefinition, AIActorContext, AIConfirmationPayload } from '../../types/aiAgent';
import { AIPolicyService } from './aiPolicyService';
import { AIAuditService } from './aiAuditService';
import { ResidentFamilyService } from '../residentFamilyService';
import { facilityService } from '../facilityService';
import { SuratService } from '../suratService';
import { activityCalendarService } from '../activityCalendarService';
import { TataTertibService } from '../tataTertibService';
import { INITIAL_PENGADUAN, INITIAL_TRANSAKSI, INITIAL_IURAN } from '../../data/mockData';

export const AI_TOOL_REGISTRY: Record<string, AIToolDefinition> = {
  getResidentSummary: {
    toolId: 'getResidentSummary',
    name: 'Ringkasan Data Warga',
    description: 'Mengambil ringkasan data kependudukan terdaftar dengan PDP masking',
    requiredPermission: 'RESIDENT_READ',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    dataClassification: 'INTERNAL',
    readOnly: true,
    mutating: false,
    auditEvent: 'AI_DATA_ACCESS',
    rateLimit: 30,
    confirmationRequired: false
  },
  getFamilyMembers: {
    toolId: 'getFamilyMembers',
    name: 'Daftar Anggota Keluarga',
    description: 'Mengambil daftar anggota keluarga terdaftar dalam satu KK',
    requiredPermission: 'FAMILY_READ',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    dataClassification: 'INTERNAL',
    readOnly: true,
    mutating: false,
    auditEvent: 'AI_DATA_ACCESS',
    rateLimit: 30,
    confirmationRequired: false
  },
  getLetterStatus: {
    toolId: 'getLetterStatus',
    name: 'Status Pengajuan Surat',
    description: 'Memeriksa status proses, penomoran, dan arsip surat pengantar',
    requiredPermission: 'LETTER_READ',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    dataClassification: 'INTERNAL',
    readOnly: true,
    mutating: false,
    auditEvent: 'AI_DATA_ACCESS',
    rateLimit: 30,
    confirmationRequired: false
  },
  getUpcomingActivities: {
    toolId: 'getUpcomingActivities',
    name: 'Jadwal Agenda RT',
    description: 'Mengambil agenda kegiatan warga, kerja bakti, posyandu, dan rapat RT',
    requiredPermission: 'ACTIVITY_READ',
    allowedRoles: ['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    dataClassification: 'PUBLIC',
    readOnly: true,
    mutating: false,
    auditEvent: 'AI_DATA_ACCESS',
    rateLimit: 60,
    confirmationRequired: false
  },
  getFacilityStatus: {
    toolId: 'getFacilityStatus',
    name: 'Status Fasilitas RT',
    description: 'Mengambil kondisi, lokasi, dan status operasional fasilitas lingkungan',
    requiredPermission: 'FACILITY_READ',
    allowedRoles: ['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    dataClassification: 'PUBLIC',
    readOnly: true,
    mutating: false,
    auditEvent: 'AI_DATA_ACCESS',
    rateLimit: 60,
    confirmationRequired: false
  },
  getVerifiedFacilityLocation: {
    toolId: 'getVerifiedFacilityLocation',
    name: 'Lokasi Fasilitas Terverifikasi Lapangan',
    description: 'Mengambil koordinat dan foto bukti fisik fasilitas FIELD_VERIFIED',
    requiredPermission: 'GEOBASE_READ',
    allowedRoles: ['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    dataClassification: 'PUBLIC',
    readOnly: true,
    mutating: false,
    auditEvent: 'AI_DATA_ACCESS',
    rateLimit: 60,
    confirmationRequired: false
  },
  getSurveyStatus: {
    toolId: 'getSurveyStatus',
    name: 'Status Survei Lapangan GeoBase',
    description: 'Mengambil status survei on-site, akurasi GPS, dan checklist 8 poin pengurus',
    requiredPermission: 'SURVEY_READ',
    allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
    dataClassification: 'INTERNAL',
    readOnly: true,
    mutating: false,
    auditEvent: 'AI_DATA_ACCESS',
    rateLimit: 30,
    confirmationRequired: false
  },
  getPublicSOP: {
    toolId: 'getPublicSOP',
    name: 'SOP & Tata Tertib Lingkungan',
    description: 'Mengambil klausul tata tertib, jam portal malam, dan SOP administrasi',
    requiredPermission: 'SOP_READ',
    allowedRoles: ['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    dataClassification: 'PUBLIC',
    readOnly: true,
    mutating: false,
    auditEvent: 'AI_DATA_ACCESS',
    rateLimit: 60,
    confirmationRequired: false
  },
  getComplaintStatus: {
    toolId: 'getComplaintStatus',
    name: 'Status Pengaduan & Aspirasi',
    description: 'Memeriksa tindak lanjut nomor tiket pengaduan warga',
    requiredPermission: 'COMPLAINT_READ',
    allowedRoles: ['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    dataClassification: 'INTERNAL',
    readOnly: true,
    mutating: false,
    auditEvent: 'AI_DATA_ACCESS',
    rateLimit: 30,
    confirmationRequired: false
  },
  generateReportSummary: {
    toolId: 'generateReportSummary',
    name: 'Ringkasan Laporan Lingkungan',
    description: 'Menghasilkan ringkasan agregat kependudukan, kegiatan, dan fasilitas',
    requiredPermission: 'REPORT_READ',
    allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
    dataClassification: 'INTERNAL',
    readOnly: true,
    mutating: false,
    auditEvent: 'AI_DATA_ACCESS',
    rateLimit: 20,
    confirmationRequired: false
  },
  requestDraftLetter: {
    toolId: 'requestDraftLetter',
    name: 'Draf Permohonan Surat Pengantar',
    description: 'Menyiapkan draf permohonan surat pengantar baru (Memerlukan Konfirmasi)',
    requiredPermission: 'LETTER_CREATE',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    dataClassification: 'INTERNAL',
    readOnly: false,
    mutating: true,
    auditEvent: 'AI_MUTATION_REQUESTED',
    rateLimit: 10,
    confirmationRequired: true
  },
  submitLetterRequest: {
    toolId: 'submitLetterRequest',
    name: 'Pengajuan Surat Pengantar Resmi',
    description: 'Mengirimkan pengajuan surat pengantar resmi ke pengurus RT (Memerlukan Konfirmasi)',
    requiredPermission: 'LETTER_CREATE',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    dataClassification: 'INTERNAL',
    readOnly: false,
    mutating: true,
    auditEvent: 'AI_MUTATION_REQUESTED',
    rateLimit: 10,
    confirmationRequired: true
  },
  requestDraftComplaint: {
    toolId: 'requestDraftComplaint',
    name: 'Draf Pengaduan Lingkungan',
    description: 'Menyiapkan draf tiket pengaduan warga (Memerlukan Konfirmasi)',
    requiredPermission: 'COMPLAINT_CREATE',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    dataClassification: 'INTERNAL',
    readOnly: false,
    mutating: true,
    auditEvent: 'AI_MUTATION_REQUESTED',
    rateLimit: 10,
    confirmationRequired: true
  }
};

export class AIToolRegistry {
  public static getToolDefinition(toolId: string): AIToolDefinition | undefined {
    return AI_TOOL_REGISTRY[toolId];
  }

  public static listAvailableTools(role: UserRole): AIToolDefinition[] {
    return Object.values(AI_TOOL_REGISTRY).filter((t) => t.allowedRoles.includes(role));
  }

  public static checkToolAccess(
    toolId: string,
    actor: AIActorContext
  ): { allowed: boolean; reason?: string } {
    const tool = this.getToolDefinition(toolId);
    if (!tool) {
      return { allowed: false, reason: `Tool '${toolId}' tidak terdaftar dalam AI_TOOL_REGISTRY.` };
    }

    // Role check
    if (!tool.allowedRoles.includes(actor.role)) {
      return {
        allowed: false,
        reason: `Akses ditolak: Peran '${actor.role}' tidak memiliki izin untuk memanggil tool '${tool.name}'.`
      };
    }

    // Authentication check for internal tools
    if (tool.dataClassification !== 'PUBLIC' && !actor.isAuthenticated) {
      return {
        allowed: false,
        reason: `Akses ditolak: Tool '${tool.name}' membutuhkan otentikasi login aktif.`
      };
    }

    return { allowed: true };
  }

  public static async executeTool(
    toolId: string,
    params: any,
    actor: AIActorContext
  ): Promise<{ success: boolean; data?: any; error?: string; confirmationPrompt?: AIConfirmationPayload }> {
    const access = this.checkToolAccess(toolId, actor);
    if (!access.allowed) {
      AIAuditService.logEvent({
        event: 'AI_PERMISSION_DENIED',
        actor,
        action: `EXECUTE_TOOL_${toolId}`,
        resource: toolId,
        status: 'BLOCKED',
        reason: access.reason
      });
      return { success: false, error: access.reason };
    }

    const tool = this.getToolDefinition(toolId)!;

    // Mutating 2-Step Confirmation Gate
    if (tool.mutating && !params._confirmed) {
      const confirmationPayload: AIConfirmationPayload = {
        confirmationId: `CONF-${Date.now()}-${toolId}`,
        toolId,
        toolName: tool.name,
        title: `Konfirmasi: ${tool.name}`,
        description: `Tindakan ini memerlukan persetujuan eksplisit Anda sebelum dieksekusi. Apakah Anda ingin melanjutkan?`,
        riskLevel: 'MEDIUM',
        parameters: params,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        requestedBy: actor.userName,
        requiresRole: tool.allowedRoles
      };

      return {
        success: true,
        data: { notice: 'Menunggu konfirmasi pengguna (2-Step Mutation Gate).' },
        confirmationPrompt: confirmationPayload
      };
    }

    try {
      let rawResult: any;

      switch (toolId) {
        case 'getResidentSummary': {
          const idorCheck = AIPolicyService.validateIDOR(actor, params.targetNik, params.targetFamilyId);
          if (!idorCheck.allowed) {
            return { success: false, error: idorCheck.reason };
          }
          const allWarga = ResidentFamilyService.getWargaList();
          let target = allWarga;
          if (actor.role === 'WARGA') {
            target = allWarga.filter((w) => w.id_warga === actor.userId || (actor.nik && w.nik === actor.nik));
          } else if (params.searchTerm) {
            target = ResidentFamilyService.getWargaList({ searchTerm: params.searchTerm });
          }
          rawResult = AIPolicyService.maskSensitiveObject(target, actor.role, actor.role === 'WARGA');
          break;
        }

        case 'getFamilyMembers': {
          const allKeluarga = ResidentFamilyService.getKeluargaList();
          let targetKeluarga = allKeluarga;
          if (actor.role === 'WARGA' && actor.familyId) {
            targetKeluarga = allKeluarga.filter((k) => k.id_kk === actor.familyId || k.no_kk === actor.nik);
          }
          rawResult = AIPolicyService.maskSensitiveObject(targetKeluarga, actor.role, actor.role === 'WARGA');
          break;
        }

        case 'getLetterStatus': {
          const letters = SuratService.getStoredSuratList();
          let filtered = letters;
          if (actor.role === 'WARGA') {
            filtered = letters.filter((l) => l.id_warga === actor.userId || l.nama_pemohon.toLowerCase().includes(actor.userName.toLowerCase()));
          }
          rawResult = AIPolicyService.maskSensitiveObject(filtered, actor.role, actor.role === 'WARGA');
          break;
        }

        case 'getUpcomingActivities': {
          const actorSession = {
            userId: actor.userId,
            nama: actor.userName,
            role: actor.role,
            isBackendConnected: true
          };
          const activities = activityCalendarService.getKegiatanList(actorSession);
          // Filter public vs internal
          const isPublic = actor.role === 'PUBLIC';
          rawResult = activities.filter((a) => !isPublic || (a.isPublic && a.status !== 'DRAFT'));
          break;
        }

        case 'getFacilityStatus': {
          const actorSession = {
            userId: actor.userId,
            nama: actor.userName,
            role: actor.role,
            isBackendConnected: true
          };
          const facList = facilityService.getFacilities(actorSession);
          rawResult = facList.map((f) => ({
            idFasilitas: f.fasilitasId,
            nama: f.namaFasilitas,
            kategori: f.kategori,
            kondisi: f.kondisi,
            statusOperasional: f.status,
            prioritas: f.tingkatPrioritas,
            lokasiDeskripsi: f.lokasi,
            verificationStatus: f.locationStatus || f.surveyStatus || 'REFERENCE_UNVERIFIED',
            isFieldVerified: f.locationStatus === 'FIELD_VERIFIED' || f.surveyStatus === 'FIELD_VERIFIED',
            coordinateNotice: (f.locationStatus === 'FIELD_VERIFIED' || f.surveyStatus === 'FIELD_VERIFIED')
              ? 'FIELD_VERIFIED (Koordinat GPS Fisik Nyata)'
              : 'REFERENCE_UNVERIFIED (Data Referensi — Belum Diverifikasi Lapangan)'
          }));
          break;
        }

        case 'getVerifiedFacilityLocation': {
          const actorSession = {
            userId: actor.userId,
            nama: actor.userName,
            role: actor.role,
            isBackendConnected: true
          };
          const facList = facilityService.getFacilities(actorSession);
          const verifiedOnly = facList.filter((f) => f.locationStatus === 'FIELD_VERIFIED' || f.surveyStatus === 'FIELD_VERIFIED');
          rawResult = verifiedOnly.map((f) => ({
            idFasilitas: f.fasilitasId,
            nama: f.namaFasilitas,
            kategori: f.kategori,
            latitude: f.latitude,
            longitude: f.longitude,
            accuracyMeters: f.akurasiLokasi || f.accuracyMeters || 5,
            verifiedAt: f.tanggalPemeriksaanTerakhir || f.updatedAt,
            verificationStatus: 'FIELD_VERIFIED'
          }));
          break;
        }

        case 'getSurveyStatus': {
          const actorSession = {
            userId: actor.userId,
            nama: actor.userName,
            role: actor.role,
            isBackendConnected: true
          };
          const scope = facilityService.getGeoBaseCertificationScope(actorSession);
          const evalRes = facilityService.evaluateGeoBaseCertification(actorSession);
          rawResult = {
            certificationStatus: evalRes.certificationStatus,
            totalScope: scope.totalScope,
            fieldVerified: scope.fieldVerifiedCount,
            referenceUnverified: scope.referenceUnverifiedCount,
            pendingReview: scope.pendingReviewCount,
            pilotStatus: evalRes.certificationStatus === 'PILOT_CERTIFIED' ? '5 Fasilitas Pilot Terverifikasi Lapangan' : evalRes.certificationStatus,
            blockers: evalRes.blockingReasons
          };
          break;
        }

        case 'getPublicSOP': {
          const articles = TataTertibService.getArticles();
          rawResult = articles.map((a) => ({
            nomor: a.nomor || a.kode,
            judul: a.judul,
            kategori: a.kategori,
            isi: a.isi
          }));
          break;
        }

        case 'getComplaintStatus': {
          const allAduan = INITIAL_PENGADUAN;
          if (params.ticketNumber) {
            rawResult = allAduan.filter((a) => a.nomor_tiket.toUpperCase() === params.ticketNumber.toUpperCase());
          } else {
            rawResult = allAduan.slice(0, 5).map((a) => ({
              nomor_tiket: a.nomor_tiket,
              kategori: a.kategori,
              status: a.status,
              tanggal: a.tanggal
            }));
          }
          break;
        }

        case 'generateReportSummary': {
          const actorSession = {
            userId: actor.userId,
            nama: actor.userName,
            role: actor.role,
            isBackendConnected: true
          };
          const residents = ResidentFamilyService.getWargaList();
          const families = ResidentFamilyService.getKeluargaList();
          const cert = facilityService.evaluateGeoBaseCertification(actorSession);
          const letters = SuratService.getStoredSuratList();
          rawResult = {
            totalWarga: residents.length,
            totalKeluarga: families.length,
            totalSuratBulanIni: letters.length,
            geobaseStatus: cert.certificationStatus,
            fasilitasTerverifikasi: `${cert.fieldVerified} dari ${cert.totalScope} fasilitas`,
            generatedAt: new Date().toISOString()
          };
          break;
        }

        case 'requestDraftLetter':
        case 'submitLetterRequest': {
          // Prepared draft payload returned for user review
          rawResult = {
            draftCreated: true,
            id_surat: `SURAT-${new Date().getFullYear()}-000099`,
            trackingId: `SURAT-${new Date().getFullYear()}-000099`,
            jenisSurat: params.jenisSurat || 'Surat Pengantar Umum',
            keperluan: params.keperluan || 'Administrasi Kependudukan',
            pemohon: actor.userName,
            tanggal: new Date().toISOString().slice(0, 10),
            notice: 'Draf siap diajukan ke Pengurus RT setelah konfirmasi disetujui.'
          };
          break;
        }

        case 'requestDraftComplaint': {
          rawResult = {
            draftCreated: true,
            kategori: params.kategori || 'Kebersihan Lingkungan',
            deskripsi: params.deskripsi || 'Laporan warga via AI Assistant',
            pelapor: actor.userName,
            notice: 'Tiket pengaduan siap diterbitkan setelah konfirmasi Anda.'
          };
          break;
        }

        default:
          return { success: false, error: `Tool ${toolId} belum memiliki handler aktif.` };
      }

      return { success: true, data: rawResult };
    } catch (err: any) {
      return { success: false, error: `Gagal mengeksekusi tool: ${err.message || String(err)}` };
    }
  }
}
