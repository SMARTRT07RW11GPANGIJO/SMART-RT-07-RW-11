/**
 * Konfigurasi Terpusat Identitas Dokumen & Kop Surat Resmi
 * SMART RT 07 RW 11 GPA NGIJO
 * 
 * Single Source of Truth untuk Seluruh Modul Surat, Preview, PDF & Print
 */
export const DOCUMENT_BRANDING = {
  organizationName: "RUKUN TETANGGA 07 RUKUN WARGA 11",
  housingName: "PERUMAHAN GPA NGIJO",
  district: "KECAMATAN KARANGPLOSO",
  regency: "KABUPATEN MALANG",
  province: "JAWA TIMUR",

  // Lokasi Penerbitan Surat Resmi (Locked)
  documentPlace: "Karangploso",
  letterPlace: "Karangploso",

  // Identitas Resmi Ketua RT / Pejabat Penandatangan
  chairmanName: "Eko Sucahyono",
  chairmanTitle: "Ketua RT 07 RW 11",
  chairmanOrganization: "Ketua RT 07 RW 11 Perum GPA Ngijo",

  // Asset Logo & Info Kontak
  logoKabupaten: "/assets/logo-kabupaten-malang.png",
  logoAlt: "Logo Kabupaten Malang",
  fullAddress: "Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang, Jawa Timur 65152",
  postalCode: "65152",
  tagline: "Guyub Rukun Mbangun Deso",
  contactInfo: "Email: rt07rw11.gpa@gmail.com"
};

export type DocumentBranding = typeof DOCUMENT_BRANDING;

/**
 * Permanent Locked Letterhead Contract Baseline v1.0
 */
export const OFFICIAL_LETTERHEAD = {
  logoWidth: 82,
  logoHeight: 98,
  headerHeight: 100,
  logoPath: "/assets/logo-kabupaten-malang.png",
  letterPlace: "Karangploso",
  chairmanName: "Eko Sucahyono",
  chairmanTitle: "Ketua RT 07 RW 11"
} as const;

export function assertOfficialLetterheadIntegrity(): void {
  if (OFFICIAL_LETTERHEAD.logoWidth !== 82) {
    throw new Error("OFFICIAL_LOGO_WIDTH_CHANGED");
  }
  if (OFFICIAL_LETTERHEAD.logoHeight !== 98) {
    throw new Error("OFFICIAL_LOGO_HEIGHT_CHANGED");
  }
  if (OFFICIAL_LETTERHEAD.letterPlace !== "Karangploso") {
    throw new Error("OFFICIAL_LETTER_PLACE_CHANGED");
  }
  if (OFFICIAL_LETTERHEAD.chairmanName !== "Eko Sucahyono") {
    throw new Error("OFFICIAL_CHAIRMAN_CHANGED");
  }
  if (OFFICIAL_LETTERHEAD.chairmanTitle !== "Ketua RT 07 RW 11") {
    throw new Error("OFFICIAL_CHAIRMAN_TITLE_CHANGED");
  }
}

/**
 * Helper: Ambil Tempat Surat Resmi
 * WAJIB return: "Karangploso"
 */
export function getLetterPlace(): string {
  return DOCUMENT_BRANDING.letterPlace;
}

/**
 * Helper: Ambil Nama Ketua RT Resmi
 * WAJIB return: "Eko Sucahyono"
 */
export function getChairmanName(): string {
  return DOCUMENT_BRANDING.chairmanName;
}

/**
 * Helper: Ambil Jabatan Ketua RT Resmi
 * WAJIB return: "Ketua RT 07 RW 11"
 */
export function getChairmanTitle(): string {
  return DOCUMENT_BRANDING.chairmanTitle;
}

/**
 * Validasi Signer Dokumen Resmi
 */
export function validateDocumentSigner(name?: string, title?: string): boolean {
  const targetName = name ?? DOCUMENT_BRANDING.chairmanName;
  const targetTitle = title ?? DOCUMENT_BRANDING.chairmanTitle;
  return targetName === DOCUMENT_BRANDING.chairmanName && targetTitle === DOCUMENT_BRANDING.chairmanTitle;
}

/**
 * Validasi Tempat Surat Resmi
 */
export function validateLetterPlace(place?: string): boolean {
  const targetPlace = place ?? DOCUMENT_BRANDING.letterPlace;
  return targetPlace === DOCUMENT_BRANDING.letterPlace;
}

/**
 * Validasi Dokumen Sebelum Penerbitan / Export PDF
 * Melemparkan error jika terjadi mismatch konfigurasi resmi
 */
export function assertDocumentOfficialIntegrity(place?: string, name?: string, title?: string): void {
  if (!validateLetterPlace(place) || !validateDocumentSigner(name, title)) {
    throw new Error("Konfigurasi tempat atau Ketua RT tidak sesuai dengan konfigurasi resmi SMART RT.");
  }
}
