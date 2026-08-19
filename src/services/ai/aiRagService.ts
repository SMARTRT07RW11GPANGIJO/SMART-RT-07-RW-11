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
      id: actor.userId,
      nama: actor.userName,
      role: actor.role as any,
      ipAddress: actor.ipAddress || '127.0.0.1',
      userAgent: 'SMART-RT-AI-RAG'
    };

    // LAYER 1: OFFICIAL VERIFIED DATA & REGULATIONS
    if (
      intent === 'POLICY_QUERY' ||
      intent === 'LETTER_QUERY' ||
      intent === 'ADMIN_QUERY' ||
      intent === 'GENERAL_INFORMATION' ||
      text.includes('sop') ||
      text.includes('tata tertib') ||
      text.includes('syarat')
    ) {
      const articles = TataTertibService.getArticles();
      const relevantArticles = articles.filter(
        (a) => text.includes(a.judul.toLowerCase()) || text.includes(a.kategori.toLowerCase()) || text.includes('tata tertib')
      );
      const selected = relevantArticles.length > 0 ? relevantArticles.slice(0, 3) : articles.slice(0, 2);

      selected.forEach((art) => {
        sources.push({
          sourceId: `SRC-SOP-${art.id}`,
          title: `Tata Tertib RT 07: ${art.judul} (${art.pasal})`,
          category: 'PERATURAN_RESMI',
          layer: 'LAYER_1_OFFICIAL_VERIFIED',
          verificationStatus: 'OFFICIAL',
          isVerifiedRealWorld: true,
          snippet: art.isi.substring(0, 150) + '...'
        });
        contextSnippets.push(`[SOP RESMI RT 07 - ${art.pasal}]: ${art.isi}`);
      });
      layers.add('LAYER_1_OFFICIAL_VERIFIED');
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
      text.includes('lapangan')
    ) {
      const facilities = facilityService.getFacilities(actorSession);
      const matched = facilities.filter(
        (f) =>
          text.includes(f.namaFasilitas.toLowerCase()) ||
          text.includes(f.kategori.toLowerCase()) ||
          text.includes(f.blok.toLowerCase()) ||
          text.includes('fasilitas')
      );

      const targetFacs = matched.length > 0 ? matched.slice(0, 4) : facilities.slice(0, 3);

      targetFacs.forEach((fac) => {
        const isVerified = fac.geoObject?.verificationStatus === 'FIELD_VERIFIED';
        if (!isVerified) {
          referenceDataIncluded = true;
          hasUnverifiedGeoData = true;
          layers.add('LAYER_3_REFERENCE_DATA');
          sources.push({
            sourceId: `SRC-GEO-${fac.idFasilitas}`,
            title: `${fac.namaFasilitas} [DATA REFERENSI — BELUM DIVERIFIKASI LAPANGAN]`,
            category: 'GEOBASE_FASILITAS',
            layer: 'LAYER_3_REFERENCE_DATA',
            verificationStatus: 'REFERENCE_UNVERIFIED',
            isVerifiedRealWorld: false,
            snippet: `Lokasi: ${fac.lokasiDeskripsi}, Kondisi: ${fac.kondisi}. (Status: Belum survei lapangan fisik)`
          });
          contextSnippets.push(
            `[FASILITAS RT 07 - REFERENSI BELUM VERIFIKASI LAPANGAN]: ${fac.namaFasilitas} (Blok ${fac.blok}) - Kondisi: ${fac.kondisi}, Status: ${fac.statusOperasional}. Catatan: Koordinat belum diverifikasi fisik.`
          );
        } else {
          layers.add('LAYER_1_OFFICIAL_VERIFIED');
          sources.push({
            sourceId: `SRC-GEO-${fac.idFasilitas}`,
            title: `${fac.namaFasilitas} [FIELD VERIFIED - ON-SITE]`,
            category: 'GEOBASE_FASILITAS',
            layer: 'LAYER_1_OFFICIAL_VERIFIED',
            verificationStatus: 'FIELD_VERIFIED',
            isVerifiedRealWorld: true,
            snippet: `Koordinat GPS: ${fac.geoObject?.latitude}, ${fac.geoObject?.longitude} (Akurasi: ${fac.geoObject?.accuracyMeters}m). Kondisi: ${fac.kondisi}.`
          });
          contextSnippets.push(
            `[FASILITAS RT 07 - FIELD VERIFIED]: ${fac.namaFasilitas} - Koordinat Terverifikasi: ${fac.geoObject?.latitude}, ${fac.geoObject?.longitude}, Akurasi: Grade ${fac.geoObject?.gpsAccuracyGrade}. Kondisi: ${fac.kondisi}.`
          );
        }
      });
    }

    // LAYER 2: OPERATIONAL DATA (CALENDAR & ACTIVITIES)
    if (
      intent === 'ACTIVITY_QUERY' ||
      text.includes('kegiatan') ||
      text.includes('agenda') ||
      text.includes('kerja bakti') ||
      text.includes('rapat')
    ) {
      const activities = activityCalendarService.getActivities();
      const upcoming = activities.filter((a) => a.status !== 'DRAFT').slice(0, 3);

      upcoming.forEach((act) => {
        sources.push({
          sourceId: `SRC-ACT-${act.idKegiatan}`,
          title: `Agenda: ${act.judul}`,
          category: 'AGENDA_KEGIATAN',
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
