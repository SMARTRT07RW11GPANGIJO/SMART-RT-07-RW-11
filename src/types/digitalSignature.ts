/**
 * digitalSignature.ts
 * DIGITAL SIGNATURE & VERIFICATION TYPES
 * SMART RT 07 RW 11 GPA NGIJO — GENERATOR SURAT v2.0
 */

export type SignatureStatus = 
  | 'VALID'
  | 'REVOKED'
  | 'EXPIRED'
  | 'NOT_FOUND'
  | 'INVALID_HASH'
  | 'INVALID';

export type VerificationMethod = 
  | 'INTERNAL_HASH_SHA256'
  | 'CERTIFIED_PSRE_PENDING'
  | 'CERTIFIED_PSRE';

export type DigitalSignatureProviderId = 
  | 'INTERNAL'
  | 'PSRE_PERURI'
  | 'PSRE_PRIVY'
  | 'PSRE_BSRE'
  | 'PSRE_TILAKA'
  | string;

/**
 * Minimal Canonical Document Payload for SHA-256 Hashing.
 * Never includes passwords, API keys, session tokens, or private secrets.
 */
export interface CanonicalDocumentPayload {
  documentId: string;
  nomorSurat: string;
  jenisSurat: string;
  tanggalSurat: string;
  letterPlace: string; // Must be "Karangploso"
  chairmanName: string; // Must be "Eko Sucahyono"
  chairmanTitle: string; // Must be "Ketua RT 07 RW 11"
  contentVersion: string; // e.g. "v2.0"
  pemohonNamaMasked?: string;
  keperluan?: string;
  customFields?: Record<string, string>;
}

/**
 * Metadata recorded with each digital signature.
 */
export interface SignatureMetadata {
  signatureId: string;
  documentId: string;
  signerUserId: string;
  signerName: string; // "Eko Sucahyono"
  signerTitle: string; // "Ketua RT 07 RW 11"
  signedAt: string; // ISO 8601 backend timestamp (e.g. 2026-08-16T10:32:15+07:00)
  documentHash: string; // Full 64-char SHA-256 hex string
  shortHash: string; // Short hash for display on document (e.g. 12 chars)
  signatureStatus: SignatureStatus;
  verificationMethod: VerificationMethod;
  letterPlace: string; // "Karangploso"
  providerId: DigitalSignatureProviderId;
  canonicalPayload: CanonicalDocumentPayload;
  certificateInfo?: {
    issuer: string;
    serialNumber: string;
    validFrom: string;
    validTo: string;
    isCertified: boolean;
  };
}

export interface SignerCertificate {
  certificateId: string;
  signerName: string;
  signerTitle: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  isCertified: boolean;
  providerName: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface SignatureResult {
  success: boolean;
  signatureMetadata?: SignatureMetadata;
  errorCode?: string;
  message: string;
}

export interface VerificationResult {
  status: SignatureStatus;
  isValid: boolean;
  computedHash: string;
  storedHash: string;
  signatureMetadata?: SignatureMetadata;
  canonicalPayload?: CanonicalDocumentPayload;
  tampered: boolean;
  securityWarning?: string;
  message: string;
  verifiedAt: string;
}

/**
 * Extensible Provider Interface for Digital Signature & PSrE integration.
 */
export interface DigitalSignatureProvider {
  providerId: DigitalSignatureProviderId;
  providerName: string;
  isCertified: boolean;
  signDocument(
    payload: CanonicalDocumentPayload,
    signerContext: { userId: string; role: string; name: string; title: string }
  ): Promise<SignatureResult>;
  verifySignature(
    metadata: SignatureMetadata,
    payload: CanonicalDocumentPayload
  ): Promise<VerificationResult>;
  getSignerCertificate(signerId: string): Promise<SignerCertificate | null>;
  getSignatureStatus(signatureId: string): Promise<SignatureStatus>;
}

export type DigitalSignatureAuditEventType =
  | 'DOCUMENT_SIGNED'
  | 'DOCUMENT_QR_CREATED'
  | 'DOCUMENT_VERIFIED'
  | 'DOCUMENT_REVOKED'
  | 'DOCUMENT_HASH_MISMATCH'
  | 'SIGNATURE_VERIFICATION_FAILED';

export interface DigitalSignatureAuditRecord {
  auditId: string;
  timestamp: string; // ISO 8601
  actorUserId: string;
  actorRole: string;
  documentId: string;
  event: DigitalSignatureAuditEventType;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details?: string;
  hashSnippet?: string;
}
