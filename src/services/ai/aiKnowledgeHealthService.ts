// SMART RT 07 RW 11 GPA NGIJO - AI KNOWLEDGE HEALTH SERVICE v1.0
// Real-time Health Audit for RAG Layers, GeoBase Certification, and Service Integrations

import { AIKnowledgeHealthMetrics } from '../../types/aiAgent';
import { facilityService } from '../facilityService';
import { ResidentFamilyService } from '../residentFamilyService';
import { activityCalendarService } from '../activityCalendarService';
import { TataTertibService } from '../tataTertibService';
import { INITIAL_KNOWLEDGE_BASE } from '../aiAssistantService';

export class AIKnowledgeHealthService {
  public static evaluateHealth(): AIKnowledgeHealthMetrics {
    const actorSession = {
      userId: 'SYSTEM-HEALTH',
      nama: 'AI Health Auditor',
      role: 'ADMIN' as const,
      isBackendConnected: true
    };

    // 1. GeoBase Evaluation
    const certEval = facilityService.evaluateGeoBaseCertification(actorSession);
    const scope = facilityService.getGeoBaseCertificationScope(actorSession);

    // 2. Data Sources Quantities
    const kbItems = INITIAL_KNOWLEDGE_BASE;
    const articles = TataTertibService.getArticles();
    const residents = ResidentFamilyService.getWargaList();
    const activities = activityCalendarService.getKegiatanList(actorSession);

    const verifiedCount = scope.fieldVerifiedCount + articles.length + kbItems.length;
    const referenceCount = scope.referenceUnverifiedCount;
    const operationalCount = activities.length;
    const staleCount = scope.resurveyRequiredCount;
    const missingCount = scope.rejectedCount;

    const totalItems = verifiedCount + referenceCount + operationalCount;
    const healthScorePercent = totalItems > 0 ? Math.round((verifiedCount / totalItems) * 100) : 100;

    return {
      totalItems,
      verifiedCount,
      referenceCount,
      operationalCount,
      staleCount,
      missingCount,
      healthScorePercent,
      geobaseCertification: certEval.certificationStatus,
      geobaseScopeTotal: scope.totalScope,
      geobaseFieldVerified: scope.fieldVerifiedCount,
      geobaseReferenceUnverified: scope.referenceUnverifiedCount,
      servicesStatus: {
        ResidentFamilyService: residents.length > 0 ? 'HEALTHY' : 'DEGRADED',
        FacilityGeoBaseService: certEval.certificationStatus !== 'NOT_CERTIFIED' ? 'HEALTHY' : 'DEGRADED',
        ActivityCalendarService: activities.length > 0 ? 'HEALTHY' : 'DEGRADED',
        DocumentSuratService: 'HEALTHY',
        AIAuditLogService: 'HEALTHY',
        TataTertibSOPService: articles.length > 0 ? 'HEALTHY' : 'DEGRADED'
      }
    };
  }
}
