// SMART RT 07 RW 11 GPA NGIJO - AI RAG KNOWLEDGE RETRIEVAL SERVICE v1.0
// 5-Layer Knowledge Retrieval Engine with GeoBase Grounding Safety

import { AIActorContext, AIKnowledgeLayer, AISourceCitation, AIIntent } from '../../types/aiAgent';
import { facilityService } from '../facilityService';
import { ResidentFamilyService } from '../residentFamilyService';
import { SuratService } from '../suratService';
import { activityCalendarService } from '../activityCalendarService';
import { TataTertibService } from '../tataTertibService';
import { INITIAL_KNOWLEDGE_BASE } from '../aiAssistantService';

export interface RagRetrievalResult {
  contextText: string;
  sources: AISourceCitation[];
  knowledgeLayersUsed: AIKnowledgeLayer[];
  referenceDataIncluded: boolean;
  hasUnverifiedGeoData: boolean;
}

export class AIRagService {
  public static async retrieveKnowledge(
    query: string,
    intent: AIIntent,
    actor: AIActorContext
  ): Promise<RagRetrievalResult> {
    const text = query.toLowerCase();
    const sources: AISourceCitation[] = [];
    const layers = new Set<AIKnowledgeLayer>();
    let contextSnippets: string[] = [];
    let referenceDataIncluded = false;
    let hasUnverifiedGeoData = false;

    const actorSession = {
      userId: actor.userId,
      nama: actor.userName,
      role: actor.role,
      isBackendConnected: true
    };

    // LAYER 1: OFFICIAL VERIFIED DATA & REGULATIONS (SOP & TATA TERTIB)
    if (
      intent === 'POLICY_QUERY' ||
      intent === 'LETTER_QUERY' ||
      intent === 'ADMIN_QUERY' ||
      intent === 'GENERAL_INFORMATION' ||
      text.includes('sop') ||
      text.includes('tata tertib') ||
      text.includes('syarat') ||
      text.includes('portal') ||
      text.includes('tamu') ||
      text.includes('jam malam') ||
      text.includes('aturan')
    ) {
      const articles = TataTertibService.getArticles();
      const relevantArticles = articles.filter(
        (a) => text.includes(a.judul.toLowerCase()) || text.includes(a.kategori.toLowerCase()) || text.includes('tata tertib') || text.includes('tamu') || text.includes('portal')
      );
      const selected = relevantArticles.length > 0 ? relevantArticles.slice(0, 3) : articles.slice(0, 2);

      selected.forEach((art) => {
        const pasalLabel = art.nomor || art.kode;
        sources.push({
          sourceId: `SRC-SOP-${art.id}`,
          title: `Tata Tertib RT 07: ${art.judul} (${pasalLabel})`,
          category: 'PERATURAN_RESMI',
          layer: 'LAYER_1_OFFICIAL_VERIFIED',
          verificationStatus: 'OFFICIAL',
          isVerifiedRealWorld: true,
          snippet: art.isi.substring(0, 150) + '...'
        });
        contextSnippets.push(`[SOP RESMI RT 07 - ${pasalLabel}]: ${art.isi}`);
      });
      layers.add('LAYER_1_OFFICIAL_VERIFIED');
    }

    // LAYER 2: OPERATIONAL DATA - RESIDENT & DEMOGRAPHIC DATA
    if (
      intent === 'RESIDENT_QUERY' ||
      intent === 'FAMILY_QUERY' ||
      text.includes('data kependudukan') ||
      text.includes('profil saya') ||
      text.includes('biodata') ||
      text.includes('warga')
    ) {
      if (actor.role !== 'PUBLIC') {
        const residents = ResidentFamilyService.getWargaList();
        const userResident =
          residents.find((w) => w.id_warga === actor.userId || (actor.nik && w.nik === actor.nik)) ||
          residents[0];
        if (userResident) {
          sources.push({
            sourceId: `SRC-RES-${userResident.id_warga}`,
            title: `Profil Kependudukan Resmi: ${userResident.nama_lengkap}`,
            category: 'DATA_KEPENDUDUKAN',
            layer: 'LAYER_2_OPERATIONAL_DATA',
            verificationStatus: 'VERIFIED',
            isVerifiedRealWorld: true,
            snippet: `Warga terdaftar Blok ${userResident.blok}, RT 07 RW 11 GPA Ngijo.`
          });
          contextSnippets.push(
            `[DATA WARGA RT 07]: ${userResident.nama_lengkap} (Blok ${userResident.blok}) - Status: ${userResident.statusWarga}`
          );
          layers.add('LAYER_2_OPERATIONAL_DATA');
        }
      }
    }

    // GEOBASE FACILITY RETRIEVAL (STRICT VERIFIED vs REFERENCE SEPARATION)
    if (
      intent === 'FACILITY_QUERY' ||
      intent === 'GEOSPATIAL_QUERY' ||
      intent === 'FIELD_SURVEY_QUERY' ||
      text.includes('fasilitas') ||
      text.includes('pos kamling') ||
      text.includes('cctv') ||
      text.includes('lampu') ||
      text.includes('taman') ||
      text.includes('balai') ||
      text.includes('lapangan')
    ) {
      const facilities = facilityService.getFacilities(actorSession);
      const matched = facilities.filter(
        (f) =>
          text.includes(f.namaFasilitas.toLowerCase()) ||
          text.includes(f.kategori.toLowerCase()) ||
          text.includes((f.lokasi || '').toLowerCase()) ||
          (text.includes('pos kamling') && f.namaFasilitas.toLowerCase().includes('pos')) ||
          text.includes('fasilitas')
      );

      const targetFacs = matched.length > 0 ? matched.slice(0, 4) : facilities.slice(0, 3);

      targetFacs.forEach((fac) => {
        const isVerified = fac.locationStatus === 'FIELD_VERIFIED' || fac.surveyStatus === 'FIELD_VERIFIED';
        if (!isVerified) {
          referenceDataIncluded = true;
          hasUnverifiedGeoData = true;
          layers.add('LAYER_3_REFERENCE_DATA');
          sources.push({
            sourceId: `SRC-GEO-${fac.fasilitasId}`,
            title: `${fac.namaFasilitas} [DATA REFERENSI — BELUM DIVERIFIKASI LAPANGAN]`,
            category: 'GEOBASE_FASILITAS',
            layer: 'LAYER_3_REFERENCE_DATA',
            verificationStatus: 'REFERENCE_UNVERIFIED',
            isVerifiedRealWorld: false,
            snippet: `Lokasi: ${fac.lokasi}, Kondisi: ${fac.kondisi}. (Status: Belum survei lapangan fisik)`
          });
          contextSnippets.push(
            `[FASILITAS RT 07 - REFERENSI BELUM VERIFIKASI LAPANGAN]: ${fac.namaFasilitas} - Lokasi: ${fac.lokasi}, Kondisi: ${fac.kondisi}, Status: ${fac.status}. Catatan: Koordinat administratif belum diverifikasi fisik on-site.`
          );
        } else {
          layers.add('LAYER_1_OFFICIAL_VERIFIED');
          layers.add('LAYER_2_OPERATIONAL_DATA');
          sources.push({
            sourceId: `SRC-GEO-${fac.fasilitasId}`,
            title: `${fac.namaFasilitas} [FIELD VERIFIED - ON-SITE]`,
            category: 'GEOBASE_FASILITAS',
            layer: 'LAYER_1_OFFICIAL_VERIFIED',
            verificationStatus: 'FIELD_VERIFIED',
            isVerifiedRealWorld: true,
            snippet: `Koordinat GPS: ${fac.latitude}, ${fac.longitude} (Akurasi: ${fac.akurasiLokasi || fac.accuracyMeters || 5}m). Kondisi: ${fac.kondisi}.`
          });
          contextSnippets.push(
            `[FASILITAS RT 07 - FIELD VERIFIED]: ${fac.namaFasilitas} - Koordinat Terverifikasi: ${fac.latitude}, ${fac.longitude}, Akurasi: ${fac.akurasiLokasi || fac.accuracyMeters || 5}m. Kondisi: ${fac.kondisi}.`
          );
        }
      });
    }

    // LAYER 2: OPERATIONAL DATA (CALENDAR & ACTIVITIES)
    if (
      intent === 'ACTIVITY_QUERY' ||
      text.includes('kegiatan') ||
      text.includes('agenda') ||
      text.includes('jadwal') ||
      text.includes('kerja bakti') ||
      text.includes('rapat')
    ) {
      const activities = activityCalendarService.getKegiatanList(actorSession);
      const upcoming = activities.filter((a) => a.status !== 'DRAFT').slice(0, 3);

      upcoming.forEach((act) => {
        sources.push({
          sourceId: `SRC-ACT-${act.idKegiatan}`,
          title: `Agenda: ${act.judul}`,
          category: 'JADWAL_AGENDA',
          layer: 'LAYER_2_OPERATIONAL_DATA',
          verificationStatus: 'OPERATIONAL',
          isVerifiedRealWorld: true,
          snippet: `Tanggal: ${act.tanggalMulai} ${act.waktuMulai} WIB @ ${act.lokasi}. Status: ${act.status}.`
        });
        contextSnippets.push(
          `[AGENDA RT 07]: ${act.judul} pada ${act.tanggalMulai} pukul ${act.waktuMulai} WIB di ${act.lokasi}. Penyelenggara: ${act.penyelenggara}.`
        );
      });
      layers.add('LAYER_2_OPERATIONAL_DATA');
    }

    // LAYER 5: GENERAL COMMUNITY KNOWLEDGE
    if (contextSnippets.length === 0) {
      const kb = INITIAL_KNOWLEDGE_BASE;
      kb.slice(0, 2).forEach((k) => {
        sources.push({
          sourceId: `SRC-KB-${k.id}`,
          title: k.title,
          category: k.category,
          layer: 'LAYER_5_GENERAL_KNOWLEDGE',
          verificationStatus: 'OFFICIAL',
          isVerifiedRealWorld: true,
          snippet: k.content.substring(0, 120) + '...'
        });
        contextSnippets.push(`[INFORMASI UMUM RT 07]: ${k.content}`);
      });
      layers.add('LAYER_5_GENERAL_KNOWLEDGE');
    }

    return {
      contextText: contextSnippets.join('\n\n'),
      sources,
      knowledgeLayersUsed: Array.from(layers),
      referenceDataIncluded,
      hasUnverifiedGeoData
    };
  }
}
