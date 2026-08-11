// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8D AI AUTHORIZATION ENFORCEMENT
// Human-in-the-Loop AI Confirmation Engine

import { AIToolDefinition } from './AIToolRegistry';
import { AuthoritativeSessionContext, validateSessionContext, authorizeRoleAndPermission } from '../security/authorization';
import { SecurityAuthorizationError } from '../security/securityErrors';

export interface PendingAIConfirmation {
  confirmationId: string;
  toolName: string;
  toolParams: Record<string, any>;
  sessionUserId: string;
  timestamp: string;
  previewMessage: string;
}

export function generateConfirmationRequest(
  tool: AIToolDefinition,
  params: Record<string, any>,
  sessionUserId: string
): PendingAIConfirmation {
  const confirmationId = `CONF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  
  let previewMessage = `Tindakan berisiko (${tool.riskLevel}) membutuhkan konfirmasi Anda.\nTool: ${tool.name}\nDeskripsi: ${tool.description}`;
  if (params && Object.keys(params).length > 0) {
    previewMessage += `\nParameter: ${JSON.stringify(params, null, 2)}`;
  }

  return {
    confirmationId,
    toolName: tool.name,
    toolParams: params,
    sessionUserId,
    timestamp: new Date().toISOString(),
    previewMessage
  };
}

export function validateConfirmationAndReauthorize(
  pending: PendingAIConfirmation,
  userConfirmed: boolean,
  session: AuthoritativeSessionContext,
  tool: AIToolDefinition
): void {
  if (!userConfirmed) {
    throw new SecurityAuthorizationError(
      'CONFIRMATION_REQUIRED',
      `Tindakan ${tool.name} dibatalkan oleh pengguna.`
    );
  }

  // 1. Re-validate session
  validateSessionContext(session);

  // 2. Ensure confirming user matches original requesting user
  if (pending.sessionUserId !== session.userId) {
    throw new SecurityAuthorizationError(
      'OWNERSHIP_REQUIRED',
      `User mismatch during confirmation: Requested by '${pending.sessionUserId}', confirmed by '${session.userId}'`
    );
  }

  // 3. Re-authorize role & permission immediately before execution
  authorizeRoleAndPermission(session.role, tool.requiredPermission, tool.allowedRoles);
}
