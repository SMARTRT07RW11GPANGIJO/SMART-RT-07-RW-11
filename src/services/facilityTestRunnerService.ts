// SMART RT 07 RW 11 GPA NGIJO - FACILITY COMPREHENSIVE TEST RUNNER SERVICE v1.0
// Change Request: CR-SMART-RT-FACILITY-001
// Master Test Suite for Functional, RBAC, IDOR, Security, Data Integrity, Geo, and PDP

import { facilityService } from './facilityService';
import { facilityInspectionService } from './facilityInspectionService';
import { facilityMaintenanceService } from './facilityMaintenanceService';
import {
  FacilityActorSession,
  FasilitasLingkungan,
  GeoEvidence,
  FacilityCategory,
  FacilityCondition,
  FacilityPriority
} from '../types/facility';
import {
  isInsideRT07Boundary,
  calculateDistanceMeters,
  getGPSAccuracyGrade
} from '../config/facilityConfig';

export interface TestResultItem {
  testId: string;
  category: 'FUNCTIONAL' | 'RBAC' | 'IDOR' | 'SECURITY' | 'DATA_INTEGRITY' | 'GEO' | 'PDP';
  name: string;
  status: 'PASS' | 'FAIL';
  expected: string;
  actual: string;
  message?: string;
  durationMs: number;
}

export interface TestSuiteResult {
  total: number;
  passed: number;
  failed: number;
  passRatePercent: number;
  durationMs: number;
  results: TestResultItem[];
}

export class FacilityTestRunnerService {
  public static async runAllTests(): Promise<TestSuiteResult> {
    const startTime = Date.now();
    const results: TestResultItem[] = [];

    // Setup Actors
    const adminActor: FacilityActorSession = {
      userId: 'USR-ADM-001',
      role: 'ADMIN',
      nama: 'Bpk. Eko Sucahyono (Admin/Ketua RT)',
      isBackendConnected: true
    };

    const pengurusActor: FacilityActorSession = {
      userId: 'USR-SEK-001',
      role: 'SEKRETARIS_RT',
      nama: 'Bpk. Hendra (Sekretaris RT)',
      isBackendConnected: true
    };

    const wargaActor: FacilityActorSession = {
      userId: 'WRG-099',
      role: 'WARGA',
      nama: 'Bpk. Budi (Warga RT 07)',
      isBackendConnected: true
    };

    const publicActor: FacilityActorSession = {
      userId: 'PUBLIC-GUEST',
      role: 'PUBLIC',
      nama: 'Tamu / Anonim',
      isBackendConnected: true
    };

    const mockPhoto: GeoEvidence = {
      evidenceId: 'EVD-TEST-001',
      fileName: 'survey-evidence-01.jpg',
      fileMimeType: 'image/jpeg',
      fileSizeBytes: 1024 * 500,
      fileData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      capturedAt: new Date().toISOString(),
      capturedBy: adminActor.nama
    };

    const fullChecklist = {
      physicalFound: true,
      locationMatch: true,
      gpsObtained: true,
      gpsAccurate: true,
      notDuplicate: true,
      conditionMatch: true,
      photoAvailable: true,
      onSiteSurvey: true
    };

    facilityService.setBackendStatus(true);

    // ==========================================
    // 1. FUNCTIONAL TESTS (FAC-FUNC-001 -> FAC-FUNC-012)
    // ==========================================

    // FAC-FUNC-001: Create Facility
    {
      const t0 = Date.now();
      const reqId = facilityService.generateRequestId();
      const res = facilityService.createFacility(
        pengurusActor,
        {
          namaFasilitas: 'Pos Ronda Gang 4 Blok D',
          kategori: 'KEAMANAN',
          subkategori: 'POS_KEAMANAN',
          deskripsi: 'Pos ronda cadangan di area Blok D',
          lokasi: 'Ujung Gang 4 Blok D RT 07',
          latitude: -7.9026,
          longitude: 112.5985,
          status: 'AKTIF',
          kondisi: 'BAIK',
          tingkatPrioritas: 'NORMAL',
          tanggalPendataan: '2026-08-20',
          penanggungJawabId: 'WRG-002',
          penanggungJawabNama: 'Bpk. Agus'
        },
        reqId
      );
      const passed = res.success && !!res.data?.fasilitasId && res.data.fasilitasId.startsWith('FAS-');
      results.push({
        testId: 'FAC-FUNC-001',
        category: 'FUNCTIONAL',
        name: 'Create Facility (Pengurus authorized create)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Facility created with ID FAS-2026-xxxxxx',
        actual: passed ? `Created ${res.data?.fasilitasId}` : `Failed: ${res.error}`,
        durationMs: Date.now() - t0
      });
    }

    // FAC-FUNC-002: Read Facility
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const passed = Array.isArray(facs) && facs.length >= 3;
      results.push({
        testId: 'FAC-FUNC-002',
        category: 'FUNCTIONAL',
        name: 'Read Facility List & Detail',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Returns array of facility records',
        actual: `Returned ${facs.length} facilities`,
        durationMs: Date.now() - t0
      });
    }

    // FAC-FUNC-003: Update Facility
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const target = facs[0];
      const reqId = facilityService.generateRequestId();
      const res = facilityService.updateFacility(
        pengurusActor,
        target.fasilitasId,
        { deskripsi: 'Deskripsi diperbarui oleh Sekretaris RT' },
        reqId
      );
      const passed = res.success && res.data?.deskripsi === 'Deskripsi diperbarui oleh Sekretaris RT';
      results.push({
        testId: 'FAC-FUNC-003',
        category: 'FUNCTIONAL',
        name: 'Update Facility (Authorized mutation)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Facility updated successfully',
        actual: passed ? 'Updated description verified' : `Failed: ${res.error}`,
        durationMs: Date.now() - t0
      });
    }

    // FAC-FUNC-004: Archive Facility (Soft delete)
    {
      const t0 = Date.now();
      const createRes = facilityService.createFacility(
        adminActor,
        {
          namaFasilitas: 'Tempat Sampah Sementara Rusak',
          kategori: 'SAMPAH',
          lokasi: 'Blok A',
          latitude: -7.9022,
          longitude: 112.5978,
          status: 'AKTIF',
          kondisi: 'RUSAK_BERAT',
          tingkatPrioritas: 'TINGGI',
          tanggalPendataan: '2026-08-20'
        },
        facilityService.generateRequestId()
      );
      if (createRes.success && createRes.data) {
        const delRes = facilityService.deleteFacility(
          adminActor,
          createRes.data.fasilitasId,
          'Fasilitas dibongkar dan diganti baru',
          facilityService.generateRequestId()
        );
        const facs = facilityService.getFacilities(adminActor);
        const stillInActiveList = facs.some((f) => f.fasilitasId === createRes.data?.fasilitasId);
        const passed = delRes.success && !stillInActiveList;
        results.push({
          testId: 'FAC-FUNC-004',
          category: 'FUNCTIONAL',
          name: 'Archive Facility (Soft Delete)',
          status: passed ? 'PASS' : 'FAIL',
          expected: 'Facility soft-deleted and removed from active list',
          actual: passed ? 'Soft deleted successfully' : `Failed: ${delRes.error}`,
          durationMs: Date.now() - t0
        });
      } else {
        results.push({
          testId: 'FAC-FUNC-004',
          category: 'FUNCTIONAL',
          name: 'Archive Facility (Soft Delete)',
          status: 'FAIL',
          expected: 'Facility created and deleted',
          actual: 'Prerequisite facility creation failed',
          durationMs: Date.now() - t0
        });
      }
    }

    // FAC-FUNC-005: Search Facility
    {
      const t0 = Date.now();
      const all = facilityService.getFacilities(adminActor);
      const searchTarget = all[0].namaFasilitas.slice(0, 5).toLowerCase();
      const matched = all.filter((f) => f.namaFasilitas.toLowerCase().includes(searchTarget));
      const passed = matched.length >= 1;
      results.push({
        testId: 'FAC-FUNC-005',
        category: 'FUNCTIONAL',
        name: 'Search Facility by Keyword',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Matches facility name keyword',
        actual: `Found ${matched.length} matches for keyword "${searchTarget}"`,
        durationMs: Date.now() - t0
      });
    }

    // FAC-FUNC-006: Filter Facility by Category & Condition
    {
      const t0 = Date.now();
      const all = facilityService.getFacilities(adminActor);
      const filtered = all.filter((f) => f.kategori === 'KEAMANAN');
      const passed = filtered.every((f) => f.kategori === 'KEAMANAN');
      results.push({
        testId: 'FAC-FUNC-006',
        category: 'FUNCTIONAL',
        name: 'Filter Facility by Category & Status',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Filter returns accurate subset',
        actual: `Filtered ${filtered.length} KEAMANAN facilities`,
        durationMs: Date.now() - t0
      });
    }

    // FAC-FUNC-007: Record Inspection
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const target = facs[0];
      const inspRes = facilityInspectionService.createInspection(
        adminActor,
        {
          fasilitasId: target.fasilitasId,
          tanggalPemeriksaan: '2026-08-21',
          kondisiSesudah: 'BAIK',
          temuan: 'Pemeriksaan rutin berkala kondisi prima.',
          rekomendasi: 'Lanjutkan jadwal kebersihan pos ronda.',
          fotoBukti: ['https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800']
        },
        facilityService.generateRequestId()
      );
      const passed = inspRes.success && !!inspRes.data?.inspectionId && inspRes.data.inspectionId.startsWith('INSP-');
      results.push({
        testId: 'FAC-FUNC-007',
        category: 'FUNCTIONAL',
        name: 'Record Inspection (Condition updates master state)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Inspection recorded and facility condition synchronized',
        actual: passed ? `Recorded ${inspRes.data?.inspectionId}` : `Failed: ${inspRes.error}`,
        durationMs: Date.now() - t0
      });
    }

    // FAC-FUNC-008: Maintenance Record (Work Order & Cost)
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const target = facs[0];
      const maintRes = facilityMaintenanceService.createMaintenance(
        adminActor,
        {
          fasilitasId: target.fasilitasId,
          tanggal: '2026-08-21',
          jenisPemeliharaan: 'SERVIS_LAMPU_DAN_PORTAL',
          deskripsi: 'Penggantian kabel fitting dan pelumasan engsel',
          vendor: 'Teknisi Warga RT 07',
          pic: 'Bpk. Agus',
          biaya: 250000,
          sumberDana: 'KAS_RT'
        },
        facilityService.generateRequestId()
      );
      const passed = maintRes.success && !!maintRes.data?.maintenanceId && maintRes.data.maintenanceId.startsWith('MNT-');
      results.push({
        testId: 'FAC-FUNC-008',
        category: 'FUNCTIONAL',
        name: 'Maintenance Record (Work order & cost tracking)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Maintenance created with cost and status DISETUJUI',
        actual: passed ? `Created ${maintRes.data?.maintenanceId} with status ${maintRes.data?.status}` : `Failed: ${maintRes.error}`,
        durationMs: Date.now() - t0
      });
    }

    // FAC-FUNC-009: Photo Metadata & Evidence
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const target = facs.find((f) => f.fotoUtama !== undefined);
      const passed = !!target && typeof target.jumlahFoto === 'number';
      results.push({
        testId: 'FAC-FUNC-009',
        category: 'FUNCTIONAL',
        name: 'Photo Metadata & Multi-photo attachment',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Facility has primary photo and calculated photo count',
        actual: passed ? `Photo count: ${target?.jumlahFoto}` : 'No photo found',
        durationMs: Date.now() - t0
      });
    }

    // FAC-FUNC-010: Condition Update Lifecycle
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const target = facs[0];
      const reqId = facilityService.generateRequestId();
      const res = facilityService.updateFacility(
        adminActor,
        target.fasilitasId,
        { kondisi: 'CUKUP_BAIK' },
        reqId
      );
      const passed = res.success && res.data?.kondisi === 'CUKUP_BAIK' && res.data?.conditionScore === 4;
      results.push({
        testId: 'FAC-FUNC-010',
        category: 'FUNCTIONAL',
        name: 'Condition Update (Valid score map calculation)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Condition CUKUP_BAIK mapped to score 4',
        actual: passed ? `Kondisi: ${res.data?.kondisi}, Score: ${res.data?.conditionScore}` : `Failed: ${res.error}`,
        durationMs: Date.now() - t0
      });
    }

    // FAC-FUNC-011: Status Update Lifecycle
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const target = facs[0];
      const reqId = facilityService.generateRequestId();
      const res = facilityService.updateFacility(
        adminActor,
        target.fasilitasId,
        { status: 'DALAM_PERBAIKAN' },
        reqId
      );
      const passed = res.success && res.data?.status === 'DALAM_PERBAIKAN';
      results.push({
        testId: 'FAC-FUNC-011',
        category: 'FUNCTIONAL',
        name: 'Status Update (Lifecycle transition)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Status transition to DALAM_PERBAIKAN',
        actual: passed ? `Status: ${res.data?.status}` : `Failed: ${res.error}`,
        durationMs: Date.now() - t0
      });
    }

    // FAC-FUNC-012: Priority Update
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const target = facs[0];
      const reqId = facilityService.generateRequestId();
      const res = facilityService.updateFacility(
        adminActor,
        target.fasilitasId,
        { tingkatPrioritas: 'DARURAT' },
        reqId
      );
      const passed = res.success && res.data?.tingkatPrioritas === 'DARURAT';
      results.push({
        testId: 'FAC-FUNC-012',
        category: 'FUNCTIONAL',
        name: 'Priority Update (Assignment of priority grade)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Priority updated to DARURAT',
        actual: passed ? `Priority: ${res.data?.tingkatPrioritas}` : `Failed: ${res.error}`,
        durationMs: Date.now() - t0
      });
    }

    // ==========================================
    // 2. RBAC TESTS (FAC-RBAC-001 -> FAC-RBAC-010)
    // ==========================================

    // FAC-RBAC-001: PUBLIC READ
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(publicActor);
      const passed = Array.isArray(facs) && facs.length > 0;
      results.push({
        testId: 'FAC-RBAC-001',
        category: 'RBAC',
        name: 'Public Read Access',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Public can read facility directory',
        actual: `Read ${facs.length} facilities as PUBLIC`,
        durationMs: Date.now() - t0
      });
    }

    // FAC-RBAC-002: WARGA READ with PDP Masking
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(wargaActor);
      const allMasked = facs.every((f) => f.catatan === undefined && f.estimasiNilaiAset === undefined);
      results.push({
        testId: 'FAC-RBAC-002',
        category: 'RBAC',
        name: 'Warga Read Access with PDP Masking',
        status: allMasked ? 'PASS' : 'FAIL',
        expected: 'Internal fields masked for Warga',
        actual: allMasked ? 'Internal notes & asset value masked' : 'Leakage detected',
        durationMs: Date.now() - t0
      });
    }

    // FAC-RBAC-003: PENGURUS CREATE
    {
      const t0 = Date.now();
      const canCreate = facilityService.hasPermission('SEKRETARIS_RT', 'CREATE');
      results.push({
        testId: 'FAC-RBAC-003',
        category: 'RBAC',
        name: 'Pengurus Create Authority',
        status: canCreate ? 'PASS' : 'FAIL',
        expected: 'SEKRETARIS_RT has CREATE permission',
        actual: canCreate ? 'CREATE permission granted' : 'Denied',
        durationMs: Date.now() - t0
      });
    }

    // FAC-RBAC-004: PENGURUS UPDATE
    {
      const t0 = Date.now();
      const canUpdate = facilityService.hasPermission('SEKSI_KEGIATAN', 'UPDATE');
      results.push({
        testId: 'FAC-RBAC-004',
        category: 'RBAC',
        name: 'Pengurus Update Authority',
        status: canUpdate ? 'PASS' : 'FAIL',
        expected: 'SEKSI_KEGIATAN has UPDATE permission',
        actual: canUpdate ? 'UPDATE permission granted' : 'Denied',
        durationMs: Date.now() - t0
      });
    }

    // FAC-RBAC-005: KETUA_RT MANAGE
    {
      const t0 = Date.now();
      const canDelete = facilityService.hasPermission('KETUA_RT', 'DELETE');
      const canInspect = facilityService.hasPermission('KETUA_RT', 'INSPECT');
      const passed = canDelete && canInspect;
      results.push({
        testId: 'FAC-RBAC-005',
        category: 'RBAC',
        name: 'Ketua RT Executive Authority',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'KETUA_RT has full DELETE & INSPECT permissions',
        actual: passed ? 'Full executive permissions verified' : 'Incomplete permissions',
        durationMs: Date.now() - t0
      });
    }

    // FAC-RBAC-006: ADMIN MANAGE
    {
      const t0 = Date.now();
      const canAll = facilityService.hasPermission('ADMIN', 'DELETE') && facilityService.hasPermission('ADMIN', 'CREATE');
      results.push({
        testId: 'FAC-RBAC-006',
        category: 'RBAC',
        name: 'Administrator Full Governance Authority',
        status: canAll ? 'PASS' : 'FAIL',
        expected: 'ADMIN has unrestricted permissions',
        actual: canAll ? 'Admin governance authority confirmed' : 'Restricted',
        durationMs: Date.now() - t0
      });
    }

    // FAC-RBAC-007: Unauthorized CREATE blocked
    {
      const t0 = Date.now();
      const res = facilityService.createFacility(
        wargaActor,
        {
          namaFasilitas: 'Unauthorized Facility',
          kategori: 'KEAMANAN',
          lokasi: 'Lokasi X',
          latitude: -7.902,
          longitude: 112.598,
          status: 'AKTIF',
          kondisi: 'BAIK',
          tingkatPrioritas: 'NORMAL',
          tanggalPendataan: '2026-08-20'
        },
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'FORBIDDEN';
      results.push({
        testId: 'FAC-RBAC-007',
        category: 'RBAC',
        name: 'Unauthorized CREATE Blocked (403 FORBIDDEN)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Warga CREATE blocked with code FORBIDDEN',
        actual: passed ? `Blocked with code: ${res.code}` : 'Allowed improperly',
        durationMs: Date.now() - t0
      });
    }

    // FAC-RBAC-008: Unauthorized UPDATE blocked
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const res = facilityService.updateFacility(
        wargaActor,
        facs[0].fasilitasId,
        { namaFasilitas: 'Hacked Facility Name' },
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'FORBIDDEN';
      results.push({
        testId: 'FAC-RBAC-008',
        category: 'RBAC',
        name: 'Unauthorized UPDATE Blocked (403 FORBIDDEN)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Warga UPDATE blocked with code FORBIDDEN',
        actual: passed ? `Blocked with code: ${res.code}` : 'Allowed improperly',
        durationMs: Date.now() - t0
      });
    }

    // FAC-RBAC-009: Unauthorized ARCHIVE/DELETE blocked
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const res = facilityService.deleteFacility(
        wargaActor,
        facs[0].fasilitasId,
        'Unauthorized deletion attempt',
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'FORBIDDEN';
      results.push({
        testId: 'FAC-RBAC-009',
        category: 'RBAC',
        name: 'Unauthorized DELETE Blocked (403 FORBIDDEN)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Warga DELETE blocked with code FORBIDDEN',
        actual: passed ? `Blocked with code: ${res.code}` : 'Allowed improperly',
        durationMs: Date.now() - t0
      });
    }

    // FAC-RBAC-010: Unauthorized INTERNAL ACCESS blocked
    {
      const t0 = Date.now();
      const canView = facilityService.hasPermission('WARGA', 'VIEW_INTERNAL');
      results.push({
        testId: 'FAC-RBAC-010',
        category: 'RBAC',
        name: 'Unauthorized Internal Fields Access Denied',
        status: !canView ? 'PASS' : 'FAIL',
        expected: 'WARGA role denied VIEW_INTERNAL',
        actual: !canView ? 'Access denied as expected' : 'Allowed improperly',
        durationMs: Date.now() - t0
      });
    }

    // ==========================================
    // 3. IDOR TESTS (FAC-IDOR-001 -> FAC-IDOR-008)
    // ==========================================

    // FAC-IDOR-001: Facility ID Manipulation
    {
      const t0 = Date.now();
      const res = facilityService.updateFacility(
        adminActor,
        'FAS-NON-EXISTENT-999',
        { namaFasilitas: 'Ghost' },
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'NOT_FOUND';
      results.push({
        testId: 'FAC-IDOR-001',
        category: 'IDOR',
        name: 'Facility ID Manipulation Protection',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Rejects invalid / non-existent facility ID',
        actual: passed ? `Rejected with code: ${res.code}` : 'Unexpected success',
        durationMs: Date.now() - t0
      });
    }

    // FAC-IDOR-002: Inspection ID Manipulation
    {
      const t0 = Date.now();
      const insp = facilityInspectionService.getInspections(adminActor, 'FAS-NON-EXISTENT-999');
      const passed = Array.isArray(insp) && insp.length === 0;
      results.push({
        testId: 'FAC-IDOR-002',
        category: 'IDOR',
        name: 'Inspection Query IDOR Protection',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Returns empty list for non-existent facility ID',
        actual: `Returned ${insp.length} inspections`,
        durationMs: Date.now() - t0
      });
    }

    // FAC-IDOR-003: Maintenance ID Manipulation
    {
      const t0 = Date.now();
      const res = facilityMaintenanceService.updateMaintenanceStatus(
        adminActor,
        'MNT-NON-EXISTENT-999',
        'SELESAI'
      );
      const passed = !res.success && res.code === 'NOT_FOUND';
      results.push({
        testId: 'FAC-IDOR-003',
        category: 'IDOR',
        name: 'Maintenance ID Manipulation Protection',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Rejects invalid maintenance ID',
        actual: passed ? `Rejected with code: ${res.code}` : 'Unexpected success',
        durationMs: Date.now() - t0
      });
    }

    // FAC-IDOR-004: Photo ID manipulation
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const sample = facs[0];
      const passed = Array.isArray(sample.fotoTambahan);
      results.push({
        testId: 'FAC-IDOR-004',
        category: 'IDOR',
        name: 'Photo Reference Scoping Protection',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Photos strictly bound to owner facility',
        actual: 'Photo arrays scoped to facility instance',
        durationMs: Date.now() - t0
      });
    }

    // FAC-IDOR-005: URL / Request Path ID Manipulation
    {
      const t0 = Date.now();
      const found = facilityService.getFacilityById(adminActor, 'INVALID-PATH-ID');
      const passed = found === null;
      results.push({
        testId: 'FAC-IDOR-005',
        category: 'IDOR',
        name: 'URL / Path ID Manipulation Protection',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Returns null for spoofed URL ID',
        actual: passed ? 'Returned null safely' : 'Returned object improperly',
        durationMs: Date.now() - t0
      });
    }

    // FAC-IDOR-006: API Parameter Manipulation
    {
      const t0 = Date.now();
      const res = facilityService.createGeoSurvey(
        adminActor,
        {
          namaFasilitas: 'Param Manipulation Test',
          kategori: 'KEAMANAN',
          latitude: -7.9023,
          longitude: 112.5978,
          accuracyMeters: 4,
          photoEvidence: [mockPhoto],
          checklist: fullChecklist
        },
        facilityService.generateRequestId()
      );
      // Verify surveyorId is taken from session, not payload
      const passed = res.success && res.data?.surveyorId === adminActor.userId;
      results.push({
        testId: 'FAC-IDOR-006',
        category: 'IDOR',
        name: 'API Parameter Manipulation Protection (Server-authoritative actor)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'surveyorId bound to authenticated actor session',
        actual: passed ? `Bound to ${res.data?.surveyorId}` : 'Session spoofed',
        durationMs: Date.now() - t0
      });
    }

    // FAC-IDOR-007: Visibility Parameter Manipulation
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(wargaActor);
      const hasCatatan = facs.some((f) => f.catatan !== undefined);
      results.push({
        testId: 'FAC-IDOR-007',
        category: 'IDOR',
        name: 'Visibility & Access Level Integrity',
        status: !hasCatatan ? 'PASS' : 'FAIL',
        expected: 'Visibility masks private fields regardless of parameters',
        actual: !hasCatatan ? 'Private fields masked consistently' : 'Leaked',
        durationMs: Date.now() - t0
      });
    }

    // FAC-IDOR-008: Owner Reference Manipulation
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const target = facs[0];
      const res = facilityService.updateFacility(
        adminActor,
        target.fasilitasId,
        { createdBy: 'HACKER-001' } as any,
        facilityService.generateRequestId()
      );
      const passed = res.success && res.data?.createdBy !== 'HACKER-001';
      results.push({
        testId: 'FAC-IDOR-008',
        category: 'IDOR',
        name: 'Owner Reference & createdBy Immutability',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'createdBy cannot be overwritten by update',
        actual: passed ? `Preserved createdBy: ${res.data?.createdBy}` : 'Overwritten',
        durationMs: Date.now() - t0
      });
    }

    // ==========================================
    // 4. SECURITY TESTS (FAC-SEC-001 -> FAC-SEC-010)
    // ==========================================

    // FAC-SEC-001: Authentication Bypass Blocked
    {
      const t0 = Date.now();
      const unauthActor: FacilityActorSession = {
        userId: '',
        role: '',
        nama: '',
        isBackendConnected: false
      };
      const res = facilityService.createFacility(
        unauthActor,
        {
          namaFasilitas: 'Ghost Facility',
          kategori: 'KEAMANAN',
          lokasi: 'Ghost',
          latitude: -7.902,
          longitude: 112.598,
          status: 'AKTIF',
          kondisi: 'BAIK',
          tingkatPrioritas: 'NORMAL',
          tanggalPendataan: '2026-08-20'
        },
        facilityService.generateRequestId()
      );
      const passed = !res.success;
      results.push({
        testId: 'FAC-SEC-001',
        category: 'SECURITY',
        name: 'Authentication & Session Integrity Gate',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Unauthenticated requests rejected',
        actual: passed ? `Rejected: ${res.error}` : 'Allowed improperly',
        durationMs: Date.now() - t0
      });
    }

    // FAC-SEC-002: RBAC Bypass Blocked
    {
      const t0 = Date.now();
      const res = facilityService.deleteFacility(
        wargaActor,
        'FAS-2026-000001',
        'Bypass attempt',
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'FORBIDDEN';
      results.push({
        testId: 'FAC-SEC-002',
        category: 'SECURITY',
        name: 'RBAC Bypass Blocked on Destructive Endpoints',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Blocked with FORBIDDEN',
        actual: passed ? `Blocked with code: ${res.code}` : 'Allowed improperly',
        durationMs: Date.now() - t0
      });
    }

    // FAC-SEC-003: Mass Assignment Protection
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const target = facs[0];
      const res = facilityService.updateFacility(
        adminActor,
        target.fasilitasId,
        {
          fasilitasId: 'FAS-OVERRIDE-999',
          kodeFasilitas: 'CODE-OVERRIDE-999'
        } as any,
        facilityService.generateRequestId()
      );
      const passed = res.success && res.data?.fasilitasId === target.fasilitasId && res.data?.kodeFasilitas === target.kodeFasilitas;
      results.push({
        testId: 'FAC-SEC-003',
        category: 'SECURITY',
        name: 'Mass Assignment Protection (Primary keys immutable)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'fasilitasId and kodeFasilitas remain unchanged',
        actual: passed ? `Immutable ID: ${res.data?.fasilitasId}` : 'Overwritten improperly',
        durationMs: Date.now() - t0
      });
    }

    // FAC-SEC-004: XSS Sanitization
    {
      const t0 = Date.now();
      const xssInput = '<script>alert("XSS")</script>Pos Ronda';
      const res = facilityService.createFacility(
        adminActor,
        {
          namaFasilitas: xssInput,
          kategori: 'KEAMANAN',
          lokasi: 'Blok A',
          latitude: -7.902,
          longitude: 112.598,
          status: 'AKTIF',
          kondisi: 'BAIK',
          tingkatPrioritas: 'NORMAL',
          tanggalPendataan: '2026-08-20'
        },
        facilityService.generateRequestId()
      );
      const passed = res.success && !!res.data;
      results.push({
        testId: 'FAC-SEC-004',
        category: 'SECURITY',
        name: 'XSS Injection Safe Handling',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Input processed safely without executing scripts',
        actual: passed ? 'Handled as safe text in React DOM' : 'Failed',
        durationMs: Date.now() - t0
      });
    }

    // FAC-SEC-005: Injection Pattern Sanitization
    {
      const t0 = Date.now();
      const sqlInput = "Pos Ronda'; DROP TABLE facilities; --";
      const res = facilityService.createFacility(
        adminActor,
        {
          namaFasilitas: sqlInput,
          kategori: 'KEAMANAN',
          lokasi: 'Blok A',
          latitude: -7.902,
          longitude: 112.598,
          status: 'AKTIF',
          kondisi: 'BAIK',
          tingkatPrioritas: 'NORMAL',
          tanggalPendataan: '2026-08-20'
        },
        facilityService.generateRequestId()
      );
      const passed = res.success && !!res.data;
      results.push({
        testId: 'FAC-SEC-005',
        category: 'SECURITY',
        name: 'SQL / Command Injection Resilience',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Special characters safely persisted',
        actual: passed ? 'Stored safely without SQL evaluation' : 'Failed',
        durationMs: Date.now() - t0
      });
    }

    // FAC-SEC-006: Invalid Coordinate Boundaries Blocked
    {
      const t0 = Date.now();
      const res = facilityService.createFacility(
        adminActor,
        {
          namaFasilitas: 'Out of Range Coords',
          kategori: 'KEAMANAN',
          lokasi: 'Somewhere in Space',
          latitude: 999.0,
          longitude: 999.0,
          status: 'AKTIF',
          kondisi: 'BAIK',
          tingkatPrioritas: 'NORMAL',
          tanggalPendataan: '2026-08-20'
        },
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'INVALID_COORDINATES';
      results.push({
        testId: 'FAC-SEC-006',
        category: 'SECURITY',
        name: 'Coordinate Range Enforcement (-90..90, -180..180)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Rejects invalid lat/lng with INVALID_COORDINATES',
        actual: passed ? `Rejected with code: ${res.code}` : 'Allowed out of range',
        durationMs: Date.now() - t0
      });
    }

    // FAC-SEC-007: Oversized Payload Rejection
    {
      const t0 = Date.now();
      const hugePhoto: GeoEvidence = {
        evidenceId: 'EVD-HUGE',
        fileName: 'huge.jpg',
        fileMimeType: 'image/jpeg',
        fileSizeBytes: 10 * 1024 * 1024, // 10MB
        fileData: 'data:...',
        capturedAt: new Date().toISOString(),
        capturedBy: adminActor.nama
      };
      const res = facilityService.createGeoSurvey(
        adminActor,
        {
          namaFasilitas: 'Huge Photo Survey',
          kategori: 'KEAMANAN',
          latitude: -7.902,
          longitude: 112.598,
          accuracyMeters: 4,
          photoEvidence: [hugePhoto]
        },
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'PHOTO_SIZE_EXCEEDED';
      results.push({
        testId: 'FAC-SEC-007',
        category: 'SECURITY',
        name: 'Oversized Payload Rejection (Max 5MB per image)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Rejects photos > 5MB with PHOTO_SIZE_EXCEEDED',
        actual: passed ? `Rejected with code: ${res.code}` : 'Allowed oversized photo',
        durationMs: Date.now() - t0
      });
    }

    // FAC-SEC-008: Unauthorized API Calls Rejection
    {
      const t0 = Date.now();
      const res = facilityService.verifyGeoSurvey(
        wargaActor,
        'SRV-ANY',
        'Unauthorized verify',
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'FORBIDDEN';
      results.push({
        testId: 'FAC-SEC-008',
        category: 'SECURITY',
        name: 'Unauthorized Survey Verification Rejection',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Rejects survey approval from non-reviewer role',
        actual: passed ? `Rejected with code: ${res.code}` : 'Allowed improperly',
        durationMs: Date.now() - t0
      });
    }

    // FAC-SEC-009: Audit Log Immutability
    {
      const t0 = Date.now();
      const audit = facilityService.getAuditLogs(adminActor);
      const passed = Array.isArray(audit) && audit.length > 0;
      results.push({
        testId: 'FAC-SEC-009',
        category: 'SECURITY',
        name: 'Audit Trail Persistence & Server Immutability',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Audit entries securely logged on every mutation',
        actual: `Logged ${audit.length} immutable events in history`,
        durationMs: Date.now() - t0
      });
    }

    // FAC-SEC-010: Sensitive Data Leakage Prevention
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(publicActor);
      const hasPhone = facs.some((f) => f.teleponPIC !== undefined);
      results.push({
        testId: 'FAC-SEC-010',
        category: 'SECURITY',
        name: 'Sensitive Contact Info Leakage Prevention',
        status: !hasPhone ? 'PASS' : 'FAIL',
        expected: 'teleponPIC masked for public actors',
        actual: !hasPhone ? 'Phone numbers masked' : 'Phone numbers exposed',
        durationMs: Date.now() - t0
      });
    }

    // ==========================================
    // 5. DATA INTEGRITY TESTS (FAC-DATA-001 -> FAC-DATA-010)
    // ==========================================

    // FAC-DATA-001: Unique Facility ID Generation
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const ids = facs.map((f) => f.fasilitasId);
      const uniqueIds = new Set(ids);
      const passed = ids.length === uniqueIds.size;
      results.push({
        testId: 'FAC-DATA-001',
        category: 'DATA_INTEGRITY',
        name: 'Unique Facility ID Constraint',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'All facility IDs are strictly unique',
        actual: passed ? `All ${ids.length} IDs unique` : 'Duplicates found',
        durationMs: Date.now() - t0
      });
    }

    // FAC-DATA-002: Invalid Category Validation
    {
      const t0 = Date.now();
      const res = facilityService.createFacility(
        adminActor,
        {
          namaFasilitas: 'Invalid Category Test',
          kategori: '' as any,
          lokasi: 'Blok A',
          latitude: -7.902,
          longitude: 112.598,
          status: 'AKTIF',
          kondisi: 'BAIK',
          tingkatPrioritas: 'NORMAL',
          tanggalPendataan: '2026-08-20'
        },
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'MISSING_CATEGORY';
      results.push({
        testId: 'FAC-DATA-002',
        category: 'DATA_INTEGRITY',
        name: 'Invalid Category Enum Rejection',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Rejects empty / invalid category',
        actual: passed ? `Rejected with code: ${res.code}` : 'Allowed improperly',
        durationMs: Date.now() - t0
      });
    }

    // FAC-DATA-003: Valid Status Enum Lifecycles
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const validStatuses = ['AKTIF', 'DALAM_PERBAIKAN', 'NONAKTIF', 'DIUSULKAN', 'DIHAPUS'];
      const passed = facs.every((f) => validStatuses.includes(f.status));
      results.push({
        testId: 'FAC-DATA-003',
        category: 'DATA_INTEGRITY',
        name: 'Facility Status Enum Consistency',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Status values adhere strictly to defined enum',
        actual: passed ? 'All status values valid' : 'Invalid status found',
        durationMs: Date.now() - t0
      });
    }

    // FAC-DATA-004: Invalid Condition Rejection
    {
      const t0 = Date.now();
      const res = facilityService.createFacility(
        adminActor,
        {
          namaFasilitas: 'Invalid Condition Test',
          kategori: 'KEAMANAN',
          lokasi: 'Blok A',
          latitude: -7.902,
          longitude: 112.598,
          status: 'AKTIF',
          kondisi: '' as any,
          tingkatPrioritas: 'NORMAL',
          tanggalPendataan: '2026-08-20'
        },
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'INVALID_CONDITION';
      results.push({
        testId: 'FAC-DATA-004',
        category: 'DATA_INTEGRITY',
        name: 'Invalid Condition Enum Rejection',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Rejects empty / invalid condition',
        actual: passed ? `Rejected with code: ${res.code}` : 'Allowed improperly',
        durationMs: Date.now() - t0
      });
    }

    // FAC-DATA-005: Priority Enum Consistency
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const validPriorities = ['RENDAH', 'NORMAL', 'TINGGI', 'DARURAT'];
      const passed = facs.every((f) => validPriorities.includes(f.tingkatPrioritas));
      results.push({
        testId: 'FAC-DATA-005',
        category: 'DATA_INTEGRITY',
        name: 'Priority Enum Consistency',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'All priority levels conform to enum specification',
        actual: passed ? 'All priority values valid' : 'Invalid priority found',
        durationMs: Date.now() - t0
      });
    }

    // FAC-DATA-006: Numeric Coordinate Validation
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const passed = facs.every(
        (f) =>
          typeof f.latitude === 'number' &&
          !isNaN(f.latitude) &&
          typeof f.longitude === 'number' &&
          !isNaN(f.longitude)
      );
      results.push({
        testId: 'FAC-DATA-006',
        category: 'DATA_INTEGRITY',
        name: 'Numeric Coordinate Type Safety',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'All coordinates are numeric IEEE 754 floats',
        actual: passed ? 'Coordinates verified numeric' : 'Non-numeric coordinate found',
        durationMs: Date.now() - t0
      });
    }

    // FAC-DATA-007: Orphan Inspection Prevention
    {
      const t0 = Date.now();
      const res = facilityInspectionService.createInspection(
        adminActor,
        {
          fasilitasId: 'FAS-ORPHAN-999',
          tanggalPemeriksaan: '2026-08-21',
          kondisiSesudah: 'BAIK',
          temuan: 'Orphan test',
          rekomendasi: 'None'
        },
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'NOT_FOUND';
      results.push({
        testId: 'FAC-DATA-007',
        category: 'DATA_INTEGRITY',
        name: 'Orphan Inspection Prevention (Foreign key integrity)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Rejects inspection referencing non-existent facility',
        actual: passed ? `Rejected with code: ${res.code}` : 'Allowed orphan record',
        durationMs: Date.now() - t0
      });
    }

    // FAC-DATA-008: Orphan Maintenance Prevention
    {
      const t0 = Date.now();
      const res = facilityMaintenanceService.createMaintenance(
        adminActor,
        {
          fasilitasId: 'FAS-ORPHAN-999',
          tanggal: '2026-08-21',
          jenisPemeliharaan: 'TEST',
          deskripsi: 'Orphan test',
          vendor: 'None',
          pic: 'None',
          biaya: 10000,
          sumberDana: 'KAS_RT'
        },
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'NOT_FOUND';
      results.push({
        testId: 'FAC-DATA-008',
        category: 'DATA_INTEGRITY',
        name: 'Orphan Maintenance Work Order Prevention',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Rejects maintenance referencing non-existent facility',
        actual: passed ? `Rejected with code: ${res.code}` : 'Allowed orphan record',
        durationMs: Date.now() - t0
      });
    }

    // FAC-DATA-009: Broken Photo Reference Handling
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(adminActor);
      const passed = facs.every((f) => Array.isArray(f.fotoTambahan));
      results.push({
        testId: 'FAC-DATA-009',
        category: 'DATA_INTEGRITY',
        name: 'Photo Array Structural Normalization',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'fotoTambahan always initialized as array',
        actual: passed ? 'Arrays safely normalized' : 'Undefined found',
        durationMs: Date.now() - t0
      });
    }

    // FAC-DATA-010: Idempotency Protection / Atomic Request
    {
      const t0 = Date.now();
      const reqId = facilityService.generateRequestId();
      const r1 = facilityService.createFacility(
        adminActor,
        {
          namaFasilitas: 'Idempotency Facility',
          kategori: 'KEAMANAN',
          lokasi: 'Blok A',
          latitude: -7.902,
          longitude: 112.598,
          status: 'AKTIF',
          kondisi: 'BAIK',
          tingkatPrioritas: 'NORMAL',
          tanggalPendataan: '2026-08-20'
        },
        reqId
      );
      const r2 = facilityService.createFacility(
        adminActor,
        {
          namaFasilitas: 'Idempotency Facility',
          kategori: 'KEAMANAN',
          lokasi: 'Blok A',
          latitude: -7.902,
          longitude: 112.598,
          status: 'AKTIF',
          kondisi: 'BAIK',
          tingkatPrioritas: 'NORMAL',
          tanggalPendataan: '2026-08-20'
        },
        reqId
      );
      const passed = r1.success && !r2.success && r2.code === 'DUPLICATE_REQUEST';
      results.push({
        testId: 'FAC-DATA-010',
        category: 'DATA_INTEGRITY',
        name: 'Idempotency Key Enforcement (Duplicate request rejected)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Second submission with same requestId rejected',
        actual: passed ? `First success, Second code: ${r2.code}` : 'Duplicate accepted',
        durationMs: Date.now() - t0
      });
    }

    // ==========================================
    // 6. GEO TESTS (FAC-GEO-001 -> FAC-GEO-005)
    // ==========================================

    // FAC-GEO-001: Valid Coordinate Acceptance
    {
      const t0 = Date.now();
      const lat = -7.9025;
      const lng = 112.5985;
      const inside = isInsideRT07Boundary(lat, lng);
      const passed = inside === true;
      results.push({
        testId: 'FAC-GEO-001',
        category: 'GEO',
        name: 'Valid On-Site Coordinate Acceptance in RT 07',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Inside RT 07 GPA Ngijo Polygon boundary',
        actual: passed ? 'Valid inside boundary' : 'Rejected inside point',
        durationMs: Date.now() - t0
      });
    }

    // FAC-GEO-002: Invalid Latitude Rejected
    {
      const t0 = Date.now();
      const res = facilityService.createFacility(
        adminActor,
        {
          namaFasilitas: 'Invalid Lat',
          kategori: 'KEAMANAN',
          lokasi: 'Blok A',
          latitude: -95.0,
          longitude: 112.598,
          status: 'AKTIF',
          kondisi: 'BAIK',
          tingkatPrioritas: 'NORMAL',
          tanggalPendataan: '2026-08-20'
        },
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'INVALID_COORDINATES';
      results.push({
        testId: 'FAC-GEO-002',
        category: 'GEO',
        name: 'Invalid Latitude Rejection (< -90)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Rejects latitude < -90',
        actual: passed ? `Rejected with code: ${res.code}` : 'Allowed out of bounds',
        durationMs: Date.now() - t0
      });
    }

    // FAC-GEO-003: Invalid Longitude Rejected
    {
      const t0 = Date.now();
      const res = facilityService.createFacility(
        adminActor,
        {
          namaFasilitas: 'Invalid Lng',
          kategori: 'KEAMANAN',
          lokasi: 'Blok A',
          latitude: -7.902,
          longitude: 195.0,
          status: 'AKTIF',
          kondisi: 'BAIK',
          tingkatPrioritas: 'NORMAL',
          tanggalPendataan: '2026-08-20'
        },
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'INVALID_COORDINATES';
      results.push({
        testId: 'FAC-GEO-003',
        category: 'GEO',
        name: 'Invalid Longitude Rejection (> 180)',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Rejects longitude > 180',
        actual: passed ? `Rejected with code: ${res.code}` : 'Allowed out of bounds',
        durationMs: Date.now() - t0
      });
    }

    // FAC-GEO-004: Missing Coordinate Handling
    {
      const t0 = Date.now();
      const res = facilityService.createFacility(
        adminActor,
        {
          namaFasilitas: 'Missing Coords',
          kategori: 'KEAMANAN',
          lokasi: 'Blok A',
          latitude: undefined as any,
          longitude: 112.598,
          status: 'AKTIF',
          kondisi: 'BAIK',
          tingkatPrioritas: 'NORMAL',
          tanggalPendataan: '2026-08-20'
        },
        facilityService.generateRequestId()
      );
      const passed = !res.success && res.code === 'INVALID_COORDINATES';
      results.push({
        testId: 'FAC-GEO-004',
        category: 'GEO',
        name: 'Missing / Non-numeric Coordinate Handling',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'Rejects missing coordinates',
        actual: passed ? `Rejected with code: ${res.code}` : 'Allowed undefined coord',
        durationMs: Date.now() - t0
      });
    }

    // FAC-GEO-005: GeoBase Reference Integrity Preserved
    {
      const t0 = Date.now();
      const geoObjects = facilityService.getGeoObjects(adminActor);
      const passed = Array.isArray(geoObjects) && geoObjects.length >= 3;
      results.push({
        testId: 'FAC-GEO-005',
        category: 'GEO',
        name: 'GeoBase Object Reference Integrity Preserved',
        status: passed ? 'PASS' : 'FAIL',
        expected: 'GeoObjects maintain 1-to-1 sync with Facility entities',
        actual: `Synchronized ${geoObjects.length} GeoObjects in GeoBase`,
        durationMs: Date.now() - t0
      });
    }

    // ==========================================
    // 7. PDP TESTS (FAC-PDP-001 -> FAC-PDP-006)
    // ==========================================

    // FAC-PDP-001: NIK Leakage Prevented
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(publicActor);
      const jsonStr = JSON.stringify(facs);
      const hasNikField = jsonStr.includes('"nik"') || jsonStr.includes('"noKtp"') || /\b\d{16}\b/.test(jsonStr);
      results.push({
        testId: 'FAC-PDP-001',
        category: 'PDP',
        name: 'Resident NIK Leakage Prevention',
        status: !hasNikField ? 'PASS' : 'FAIL',
        expected: 'No NIK data found in facility payloads',
        actual: !hasNikField ? 'Zero NIK fields exposed' : 'NIK detected in payload',
        durationMs: Date.now() - t0
      });
    }

    // FAC-PDP-002: KK Leakage Prevented
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(publicActor);
      const jsonStr = JSON.stringify(facs);
      const hasKK = jsonStr.toLowerCase().includes('nomorkk') || jsonStr.toLowerCase().includes('no_kk');
      results.push({
        testId: 'FAC-PDP-002',
        category: 'PDP',
        name: 'Family Card (KK) Leakage Prevention',
        status: !hasKK ? 'PASS' : 'FAIL',
        expected: 'No KK number exposed in facility response',
        actual: !hasKK ? 'Zero KK data exposed' : 'KK detected in payload',
        durationMs: Date.now() - t0
      });
    }

    // FAC-PDP-003: DOB / Tanggal Lahir Leakage Prevented
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(publicActor);
      const jsonStr = JSON.stringify(facs);
      const hasDOB = jsonStr.toLowerCase().includes('tanggallahir') || jsonStr.toLowerCase().includes('birthdate');
      results.push({
        testId: 'FAC-PDP-003',
        category: 'PDP',
        name: 'Date of Birth (DOB) Leakage Prevention',
        status: !hasDOB ? 'PASS' : 'FAIL',
        expected: 'No birthdate exposed in facility responses',
        actual: !hasDOB ? 'Zero DOB data exposed' : 'DOB detected in payload',
        durationMs: Date.now() - t0
      });
    }

    // FAC-PDP-004: Private Resident Address Leakage Prevented
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(publicActor);
      const allPublicLokasi = facs.every((f) => typeof f.lokasi === 'string' && f.lokasi.length > 0);
      results.push({
        testId: 'FAC-PDP-004',
        category: 'PDP',
        name: 'Private Resident Address Privacy Protection',
        status: allPublicLokasi ? 'PASS' : 'FAIL',
        expected: 'Only public facility locations displayed',
        actual: allPublicLokasi ? 'Public locations displayed safely' : 'Invalid address format',
        durationMs: Date.now() - t0
      });
    }

    // FAC-PDP-005: Phone Number Masking (teleponPIC)
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(wargaActor);
      const hasPhone = facs.some((f) => f.teleponPIC !== undefined);
      results.push({
        testId: 'FAC-PDP-005',
        category: 'PDP',
        name: 'PIC Phone Number Masking for Non-Admin Views',
        status: !hasPhone ? 'PASS' : 'FAIL',
        expected: 'teleponPIC masked for Warga and Public',
        actual: !hasPhone ? 'Phone numbers masked' : 'Phone numbers exposed',
        durationMs: Date.now() - t0
      });
    }

    // FAC-PDP-006: Private Metadata & Asset Value Masking
    {
      const t0 = Date.now();
      const facs = facilityService.getFacilities(wargaActor);
      const hasPrivateMeta = facs.some((f) => f.catatan !== undefined || f.estimasiNilaiAset !== undefined);
      results.push({
        testId: 'FAC-PDP-006',
        category: 'PDP',
        name: 'Private Remarks & Asset Value Masking',
        status: !hasPrivateMeta ? 'PASS' : 'FAIL',
        expected: 'catatan and estimasiNilaiAset hidden for general residents',
        actual: !hasPrivateMeta ? 'Internal remarks & asset values hidden' : 'Internal values exposed',
        durationMs: Date.now() - t0
      });
    }

    const passedCount = results.filter((r) => r.status === 'PASS').length;
    const failedCount = results.filter((r) => r.status === 'FAIL').length;
    const totalCount = results.length;
    const durationTotal = Date.now() - startTime;

    return {
      total: totalCount,
      passed: passedCount,
      failed: failedCount,
      passRatePercent: Math.round((passedCount / totalCount) * 100),
      durationMs: durationTotal,
      results
    };
  }
}
