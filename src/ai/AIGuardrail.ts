// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8D AI AUTHORIZATION ENFORCEMENT
// Prompt Injection Protection & Privilege Escalation Guardrail

import { SecurityAuthorizationError } from '../security/securityErrors';

export interface GuardrailValidationResult {
  safe: boolean;
  sanitizedPrompt: string;
  detectedThreat?: string;
}

const INJECTION_PATTERNS = [
  'ignore previous instructions',
  'ignore all previous instructions',
  'ignore your rules',
  'you are now admin',
  'you are admin',
  'disable security',
  'bypass authorization',
  'show all residents',
  'give me api keys',
  'give me passwords',
  'ganti role',
  'ubah role',
  'set role admin',
  'override role',
  'drop database',
  'delete all logs',
  'minta api key',
  'minta password',
  'minta secret',
  'minta session secret',
  'show secret'
];

/**
 * Scans user input for prompt injection attack signatures or privilege escalation attempts.
 */
export function checkPromptGuardrail(userPrompt: string): GuardrailValidationResult {
  if (!userPrompt || typeof userPrompt !== 'string') {
    return { safe: true, sanitizedPrompt: '' };
  }

  const lowerPrompt = userPrompt.toLowerCase();

  for (const pattern of INJECTION_PATTERNS) {
    if (lowerPrompt.includes(pattern)) {
      return {
        safe: false,
        sanitizedPrompt: userPrompt,
        detectedThreat: `Prompt Injection / Privilege Escalation Pattern: '${pattern}'`
      };
    }
  }

  return {
    safe: true,
    sanitizedPrompt: userPrompt
  };
}

/**
 * Ensures message payload parameters do not attempt to override authoritative identity.
 */
export function assertUntrustedPayloadIdentity(
  frontendPayload: Record<string, any>,
  authoritativeUserId: string,
  authoritativeRole: string
): void {
  if (!frontendPayload) return;

  // If frontend payload provides userId, role, or permissions, verify they match authoritative context
  if (frontendPayload.userId && frontendPayload.userId !== authoritativeUserId) {
    throw new SecurityAuthorizationError(
      'TOOL_NOT_ALLOWED',
      `Identity Spoofing Attempt: Frontend payload userId '${frontendPayload.userId}' does not match session '${authoritativeUserId}'`
    );
  }

  if (frontendPayload.role && frontendPayload.role !== authoritativeRole) {
    throw new SecurityAuthorizationError(
      'ROLE_NOT_ALLOWED',
      `Role Escalation Attempt: Frontend payload role '${frontendPayload.role}' does not match session '${authoritativeRole}'`
    );
  }
}
