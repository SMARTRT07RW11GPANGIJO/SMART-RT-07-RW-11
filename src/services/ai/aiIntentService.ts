// SMART RT 07 RW 11 GPA NGIJO - AI INTENT CLASSIFIER SERVICE v1.0
// Multi-intent analysis, Entity Extraction, and Fallback Handling

import { AIIntent } from '../../types/aiAgent';

export interface ClassifiedIntentResult {
  intent: AIIntent;
  confidence: number; // 0.0 to 1.0
  matchedKeywords: string[];
  extractedEntities: {
    facilityCode?: string;
    facilityName?: string;
    letterType?: string;
    letterNumber?: string;
    complaintTicket?: string;
    residentName?: string;
    month?: string;
    category?: string;
  };
  clarificationRequired: boolean;
}

export class AIIntentService {
  public static classify(query: string): ClassifiedIntentResult {
    if (!query || query.trim().length === 0) {
      return {
        intent: 'UNKNOWN',
        confidence: 0,
        matchedKeywords: [],
        extractedEntities: {},
        clarificationRequired: true
      };
    }

    const text = query.toLowerCase().trim();
    const entities: ClassifiedIntentResult['extractedEntities'] = {};

    // Entity Extractors
    const facMatch = text.match(/(fas-[a-z0-9-]+)/i);
    if (facMatch) entities.facilityCode = facMatch[1].toUpperCase();

    const suratMatch = text.match(/(470\/\d+\/[0-9.]+\/\d+)/);
    if (suratMatch) entities.letterNumber = suratMatch[1];

    const aduMatch = text.match(/(adu-\d+-\d+)/i);
    if (aduMatch) entities.complaintTicket = aduMatch[1].toUpperCase();

    // 1. RESIDENT / PROFILE QUERY
    if (
      text.includes('profil saya') ||
      text.includes('data saya') ||
      text.includes('biodata saya') ||
      text.includes('nik saya') ||
      text.includes('kartu keluarga saya') ||
      text.includes('status kependudukan') ||
      text.includes('data warga')
    ) {
      return {
        intent: 'RESIDENT_QUERY',
        confidence: 0.95,
        matchedKeywords: ['profil saya', 'data warga', 'biodata'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 2. FAMILY QUERY
    if (
      text.includes('anggota keluarga') ||
      text.includes('data keluarga') ||
      text.includes('keluarga saya') ||
      text.includes('daftar anak') ||
      text.includes('istri saya') ||
      text.includes('suami saya')
    ) {
      return {
        intent: 'FAMILY_QUERY',
        confidence: 0.92,
        matchedKeywords: ['anggota keluarga', 'keluarga'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 3. LETTER STATUS QUERY
    if (
      text.includes('status surat') ||
      text.includes('surat saya') ||
      text.includes('cek surat') ||
      text.includes('sudah disetujui') ||
      text.includes('unduh surat')
    ) {
      return {
        intent: 'LETTER_STATUS_QUERY',
        confidence: 0.94,
        matchedKeywords: ['status surat', 'cek surat'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 4. LETTER CREATION / INQUIRY QUERY
    if (
      text.includes('buat surat') ||
      text.includes('ajukan surat') ||
      text.includes('surat pengantar') ||
      text.includes('syarat surat') ||
      text.includes('minta surat') ||
      text.includes('surat domisili') ||
      text.includes('surat ktp')
    ) {
      return {
        intent: 'LETTER_QUERY',
        confidence: 0.93,
        matchedKeywords: ['buat surat', 'surat pengantar'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 5. FIELD SURVEY QUERY
    if (
      text.includes('survei lapangan') ||
      text.includes('surveyor') ||
      text.includes('hasil survei') ||
      text.includes('akurasi gps') ||
      text.includes('foto bukti') ||
      text.includes('checklist 8')
    ) {
      return {
        intent: 'FIELD_SURVEY_QUERY',
        confidence: 0.95,
        matchedKeywords: ['survei lapangan', 'surveyor', 'checklist'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 6. GEOSPATIAL / GIS QUERY
    if (
      text.includes('koordinat') ||
      text.includes('peta rt') ||
      text.includes('geobase') ||
      text.includes('batas wilayah') ||
      text.includes('geofence') ||
      text.includes('geojson') ||
      text.includes('sertifikasi geobase')
    ) {
      return {
        intent: 'GEOSPATIAL_QUERY',
        confidence: 0.92,
        matchedKeywords: ['koordinat', 'geobase', 'geofence'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 7. FACILITY QUERY
    if (
      text.includes('fasilitas') ||
      text.includes('pos kamling') ||
      text.includes('lampu jalan') ||
      text.includes('penerangan') ||
      text.includes('cctv') ||
      text.includes('taman') ||
      text.includes('balai rw') ||
      text.includes('tempat sampah') ||
      text.includes('lapangan') ||
      text.includes('kondisi fasilitas')
    ) {
      return {
        intent: 'FACILITY_QUERY',
        confidence: 0.93,
        matchedKeywords: ['fasilitas', 'kondisi'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 8. ACTIVITY / CALENDAR QUERY
    if (
      text.includes('kegiatan') ||
      text.includes('agenda') ||
      text.includes('jadwal') ||
      text.includes('kerja bakti') ||
      text.includes('arisan') ||
      text.includes('posyandu') ||
      text.includes('rapat rt') ||
      text.includes('tahlil') ||
      text.includes('senam')
    ) {
      return {
        intent: 'ACTIVITY_QUERY',
        confidence: 0.94,
        matchedKeywords: ['kegiatan', 'agenda', 'jadwal'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 9. COMPLAINT QUERY
    if (
      text.includes('aduan') ||
      text.includes('pengaduan') ||
      text.includes('laporkan') ||
      text.includes('keluhan') ||
      text.includes('masalah lingkungan') ||
      text.includes('saluran mampet') ||
      text.includes('lampu mati')
    ) {
      return {
        intent: 'COMPLAINT_QUERY',
        confidence: 0.91,
        matchedKeywords: ['pengaduan', 'laporkan', 'keluhan'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 10. FINANCE QUERY
    if (
      text.includes('iuran') ||
      text.includes('tagihan') ||
      text.includes('kas rt') ||
      text.includes('pembayaran') ||
      text.includes('qris') ||
      text.includes('omplongan') ||
      text.includes('dana kematian')
    ) {
      return {
        intent: 'FINANCE_QUERY',
        confidence: 0.92,
        matchedKeywords: ['iuran', 'kas rt', 'tagihan'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 11. POLICY / TATA TERTIB / SOP QUERY
    if (
      text.includes('tata tertib') ||
      text.includes('sop') ||
      text.includes('peraturan') ||
      text.includes('jam malam') ||
      text.includes('portal') ||
      text.includes('tamu menginap') ||
      text.includes('keamanan')
    ) {
      return {
        intent: 'POLICY_QUERY',
        confidence: 0.94,
        matchedKeywords: ['tata tertib', 'sop', 'peraturan'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 12. REPORT / EXECUTIVE SUMMARY QUERY
    if (
      text.includes('laporan rt') ||
      text.includes('ringkasan') ||
      text.includes('rekapitulasi') ||
      text.includes('statistik') ||
      text.includes('executive summary')
    ) {
      return {
        intent: 'REPORT_QUERY',
        confidence: 0.90,
        matchedKeywords: ['laporan', 'ringkasan', 'statistik'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 13. ADMIN QUERY
    if (
      text.includes('pengurus') ||
      text.includes('ketua rt') ||
      text.includes('kontak pengurus') ||
      text.includes('struktur organisasi') ||
      text.includes('admin')
    ) {
      return {
        intent: 'ADMIN_QUERY',
        confidence: 0.89,
        matchedKeywords: ['pengurus', 'ketua rt'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 14. GENERAL COMMUNITY INFORMATION
    if (
      text.includes('profil rt') ||
      text.includes('alamat rt') ||
      text.includes('lokasi gpa') ||
      text.includes('tentang rt') ||
      text.includes('halo') ||
      text.includes('assalamu') ||
      text.includes('selamat') ||
      text.includes('bantuan') ||
      text.includes('menu')
    ) {
      return {
        intent: 'GENERAL_INFORMATION',
        confidence: 0.88,
        matchedKeywords: ['profil rt', 'halo', 'bantuan'],
        extractedEntities: entities,
        clarificationRequired: false
      };
    }

    // 15. UNKNOWN FALLBACK (SECTION 6)
    return {
      intent: 'UNKNOWN',
      confidence: 0.3,
      matchedKeywords: [],
      extractedEntities: entities,
      clarificationRequired: true
    };
  }
}
