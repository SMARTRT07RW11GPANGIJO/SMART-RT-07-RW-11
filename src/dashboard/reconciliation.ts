import {
  DashboardData,
  DashboardMetadata,
  DashboardSummary,
} from './calculationTypes';

/**
 * Reconcile Foundation:
 * - totalFiltered <= totalActive
 * - summary.totalWargaAktif === metadata.population.totalActive
 * - summary.totalWargaTerfilter === metadata.population.totalFiltered
 */
export function reconcileFoundation(
  summary: DashboardSummary,
  metadata: DashboardMetadata
): void {
  const { totalActive, totalFiltered } = metadata.population;

  if (totalFiltered > totalActive) {
    throw new Error(
      `Reconciliation Error: totalFiltered (${totalFiltered}) cannot exceed totalActive (${totalActive}).`
    );
  }

  if (summary.totalWargaAktif !== totalActive) {
    throw new Error(
      `Reconciliation Error: summary.totalWargaAktif (${summary.totalWargaAktif}) does not match metadata.population.totalActive (${totalActive}).`
    );
  }

  if (summary.totalWargaTerfilter !== totalFiltered) {
    throw new Error(
      `Reconciliation Error: summary.totalWargaTerfilter (${summary.totalWargaTerfilter}) does not match metadata.population.totalFiltered (${totalFiltered}).`
    );
  }
}

/**
 * Reconcile Metrics:
 * Reconciles all dimensional aggregations against total active filtered population.
 * If any reconciliation rule fails, throws an Error (which calculationEngine catches and converts to calculation_error).
 */
export function reconcileMetrics(data: DashboardData): void {
  const { summary, domisili, demografi, usia, statusPerkawinan, pendidikan, pekerjaan, nonTetap, keluarga } = data;
  const totalFiltered = summary.totalWargaTerfilter;

  // 1. Foundation
  reconcileFoundation(summary, data.metadata);

  // 2. Usia Reconciliation
  const ageGroupSum =
    usia.groups.U1.count +
    usia.groups.U2.count +
    usia.groups.U3.count +
    usia.groups.U4.count +
    usia.groups.U5.count;

  if (ageGroupSum !== usia.totalValid) {
    throw new Error(
      `Reconciliation Error [USIA]: Sum of U1-U5 groups (${ageGroupSum}) does not match totalValid (${usia.totalValid}).`
    );
  }

  if (usia.totalValid + usia.invalidOrMissingCount !== totalFiltered) {
    throw new Error(
      `Reconciliation Error [USIA]: totalValid (${usia.totalValid}) + invalidOrMissingCount (${usia.invalidOrMissingCount}) does not match totalFiltered (${totalFiltered}).`
    );
  }

  // Posyandu sub-reconciliation
  const posyanduBalitaSum =
    usia.posyandu.bayi.count +
    usia.posyandu.batita.count +
    usia.posyandu.balita.count;

  if (posyanduBalitaSum !== usia.posyandu.balitaTotal.count) {
    throw new Error(
      `Reconciliation Error [POSYANDU]: Sum of Bayi+Batita+Balita (${posyanduBalitaSum}) does not match balitaTotal (${usia.posyandu.balitaTotal.count}).`
    );
  }

  if (usia.posyandu.balitaTotal.count + usia.posyandu.anak.count !== usia.groups.U1.count) {
    throw new Error(
      `Reconciliation Error [POSYANDU]: balitaTotal (${usia.posyandu.balitaTotal.count}) + anak (${usia.posyandu.anak.count}) does not match U1 group (${usia.groups.U1.count}).`
    );
  }

  // 3. Pendidikan Reconciliation
  const educationSum = Object.values(pendidikan.categories).reduce(
    (acc, cat) => acc + cat.count,
    0
  );

  if (educationSum !== pendidikan.totalValid) {
    throw new Error(
      `Reconciliation Error [PENDIDIKAN]: Sum of categories (${educationSum}) does not match totalValid (${pendidikan.totalValid}).`
    );
  }

  if (pendidikan.totalValid + pendidikan.belumTerisiCount !== totalFiltered) {
    throw new Error(
      `Reconciliation Error [PENDIDIKAN]: totalValid (${pendidikan.totalValid}) + belumTerisiCount (${pendidikan.belumTerisiCount}) does not match totalFiltered (${totalFiltered}).`
    );
  }

  // 4. Pekerjaan Reconciliation (P1–P13)
  const pekerjaanSum = Object.values(pekerjaan.categories).reduce(
    (acc, cat) => acc + cat.count,
    0
  );

  if (pekerjaanSum !== totalFiltered) {
    throw new Error(
      `Reconciliation Error [PEKERJAAN]: Sum of P1-P13 (${pekerjaanSum}) does not match totalFiltered (${totalFiltered}).`
    );
  }

  if (pekerjaan.totalValid !== totalFiltered) {
    throw new Error(
      `Reconciliation Error [PEKERJAAN]: totalValid (${pekerjaan.totalValid}) does not match totalFiltered (${totalFiltered}).`
    );
  }

  // 5. Domisili Reconciliation
  const domisiliSum =
    domisili.categories.TETAP.count +
    domisili.categories.KONTRAK_SEWA.count +
    domisili.categories.KOS.count;

  if (domisiliSum !== domisili.totalValid) {
    throw new Error(
      `Reconciliation Error [DOMISILI]: Sum of domisili categories (${domisiliSum}) does not match totalValid (${domisili.totalValid}).`
    );
  }

  if (domisili.totalValid + domisili.missingCount !== totalFiltered) {
    throw new Error(
      `Reconciliation Error [DOMISILI]: totalValid (${domisili.totalValid}) + missingCount (${domisili.missingCount}) does not match totalFiltered (${totalFiltered}).`
    );
  }

  // 6. Demografi (Gender) Reconciliation
  const genderSum = demografi.gender.L.count + demografi.gender.P.count;

  if (genderSum !== demografi.totalValid) {
    throw new Error(
      `Reconciliation Error [GENDER]: Sum of gender L+P (${genderSum}) does not match totalValid (${demografi.totalValid}).`
    );
  }

  if (demografi.totalValid + demografi.missingCount !== totalFiltered) {
    throw new Error(
      `Reconciliation Error [GENDER]: totalValid (${demografi.totalValid}) + missingCount (${demografi.missingCount}) does not match totalFiltered (${totalFiltered}).`
    );
  }

  // 7. Status Perkawinan Reconciliation
  const maritalSum =
    statusPerkawinan.categories.BELUM_KAWIN.count +
    statusPerkawinan.categories.KAWIN.count +
    statusPerkawinan.categories.CERAI_HIDUP.count +
    statusPerkawinan.categories.CERAI_MATI.count;

  if (maritalSum !== statusPerkawinan.totalValid) {
    throw new Error(
      `Reconciliation Error [STATUS_PERKAWINAN]: Sum of marital categories (${maritalSum}) does not match totalValid (${statusPerkawinan.totalValid}).`
    );
  }

  if (statusPerkawinan.totalValid + statusPerkawinan.missingCount !== totalFiltered) {
    throw new Error(
      `Reconciliation Error [STATUS_PERKAWINAN]: totalValid (${statusPerkawinan.totalValid}) + missingCount (${statusPerkawinan.missingCount}) does not match totalFiltered (${totalFiltered}).`
    );
  }

  // 8. Non-Tetap Reconciliation
  const nonTetapSum = nonTetap.kontrakSewa.count + nonTetap.kos.count;
  if (nonTetapSum !== nonTetap.totalNonTetap) {
    throw new Error(
      `Reconciliation Error [NON_TETAP]: kontrakSewa (${nonTetap.kontrakSewa.count}) + kos (${nonTetap.kos.count}) does not match totalNonTetap (${nonTetap.totalNonTetap}).`
    );
  }

  const ownerSum =
    nonTetap.ownerDataCompleteness.lengkap.count +
    nonTetap.ownerDataCompleteness.sebagian.count +
    nonTetap.ownerDataCompleteness.tidakAda.count;

  if (ownerSum !== nonTetap.totalNonTetap) {
    throw new Error(
      `Reconciliation Error [NON_TETAP_OWNER]: Owner completeness sum (${ownerSum}) does not match totalNonTetap (${nonTetap.totalNonTetap}).`
    );
  }

  // 9. Hubungan Keluarga Reconciliation
  const familySum = Object.values(keluarga.hubunganKeluarga).reduce(
    (acc, cat) => acc + cat.count,
    0
  );

  if (familySum !== totalFiltered) {
    throw new Error(
      `Reconciliation Error [HUBUNGAN_KELUARGA]: Sum of hubungan keluarga (${familySum}) does not match totalFiltered (${totalFiltered}).`
    );
  }
}
