// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8D AI AUTHORIZATION ENFORCEMENT
// Core AI Authorization Flow Engine (Mandatory 12-Step Pipeline)

import { AIToolDefinition, getAIToolDefinition } from './AIToolRegistry';
import { AuthoritativeSessionContext, validateSessionContext, authorizeRoleAndPermission } from '../security/authorization';
import { checkResourceOwnership } from '../security/resourceAccess';
import { checkPromptGuardrail, assertUntrustedPayloadIdentity } from './AIGuardrail';
import { generateConfirmationRequest, validateConfirmationAndReauthorize, PendingAIConfirmation } from './AIConfirmation';
import { SecurityAuthorizationError, SecurityDenialCode } from '../security/securityErrors';
import { logAIAuditEntry } from '../services/aiAuthorizationService';

export interface AIExecutionRequest {
  toolName: string;
  params: Record<string, any>;
  session: AuthoritativeSessionContext;
  userPrompt?: string;
  isConfirmedByHuman?: boolean;
  pendingConfirmation?: PendingAIConfirmation;
  resourceOwnerId?: string;
}

export interface AIExecutionResult {
  success: boolean;
  data?: any;
  userFacingMessage: string;
  denialCode?: SecurityDenialCode;
  pendingConfirmation?: PendingAIConfirmation;
}

/**
 * Enforces the mandatory 12-Step AI Authorization Flow:
 * 1. Validate session
 * 2. Validate authenticated user
 * 3. Validate account status
 * 4. Determine authoritative role from backend
 * 5. Check allowed role
 * 6. Check required permission
 * 7. Check resource access
 * 8. Check resource ownership where applicable
 * 9. Check confirmation requirement
 * 10. Re-authorize immediately before execution
 * 11. Execute
 * 12. Write audit log
 */
export async function executeAIToolWithAuthorization(
  request: AIExecutionRequest,
  executorFn: (params: Record<string, any>) => Promise<any>
): Promise<AIExecutionResult> {
  const { toolName, params, session, userPrompt, isConfirmedByHuman, pendingConfirmation, resourceOwnerId } = request;

  let decision: 'SUCCESS' | 'DENIED' | 'ERROR' = 'SUCCESS';
  let denialCode: SecurityDenialCode | undefined;
  let denialReason = '';

  try {
    // 0. Guardrail Check on User Prompt & Payload Identity
    if (userPrompt) {
      const guardrail = checkPromptGuardrail(userPrompt);
      if (!guardrail.safe) {
        throw new SecurityAuthorizationError('TOOL_NOT_ALLOWED', `Blocked by Guardrail: ${guardrail.detectedThreat}`);
      }
    }
    assertUntrustedPayloadIdentity(params, session.userId, session.role);

    // Step 1 - 3: Validate Session, Authenticated User & Account Status
    validateSessionContext(session);

    // Step 4: Determine Tool Definition from Registry
    const tool = getAIToolDefinition(toolName);
    if (!tool) {
      throw new SecurityAuthorizationError('TOOL_NOT_ALLOWED', `Tool '${toolName}' is not registered in AI Tool Registry.`);
    }

    // Step 5 & 6: Check Allowed Role & Required Permission
    authorizeRoleAndPermission(session.role, tool.requiredPermission, tool.allowedRoles);

    // Step 7 & 8: Check Resource Ownership if applicable
    if (tool.requiresOwnership) {
      const targetOwner = resourceOwnerId || params.id_warga || params.userId || session.userId;
      checkResourceOwnership({
        sessionUserId: session.userId,
        sessionRole: session.role,
        targetResourceOwnerId: targetOwner,
        staffOverridePermission: tool.requiredPermission
      });
    }

    // Step 9: Check Confirmation Requirement for High/Critical/Mutation Actions
    if (tool.requiresConfirmation && !isConfirmedByHuman) {
      const pending = generateConfirmationRequest(tool, params, session.userId);
      
      logAIAuditEntry({
        userId: session.userId,
        role: session.role,
        sessionId: session.sessionId,
        action: toolName,
        tool: toolName,
        resourceId: resourceOwnerId || params.id || 'N/A',
        result: 'DENIED',
        decision: 'BLOCKED_NO_PERMISSION',
        deniedReason: 'Membutuhkan Konfirmasi Eksplisit Pengguna'
      });

      return {
        success: false,
        userFacingMessage: `Tindakan '${tool.name}' membutuhkan konfirmasi Anda.`,
        denialCode: 'CONFIRMATION_REQUIRED',
        pendingConfirmation: pending
      };
    }

    // Step 10: Re-authorize immediately before execution if confirmation was provided
    if (tool.requiresConfirmation && isConfirmedByHuman && pendingConfirmation) {
      validateConfirmationAndReauthorize(pendingConfirmation, true, session, tool);
    }

    // Step 11: Execute Tool Logic
    const executionOutput = await executorFn(params);

    // Step 12: Write Audit Log (SUCCESS)
    logAIAuditEntry({
      userId: session.userId,
      role: session.role,
      sessionId: session.sessionId,
      action: toolName,
      tool: toolName,
      resourceId: resourceOwnerId || params.id || 'N/A',
      result: 'SUCCESS',
      decision: 'ALLOWED'
    });

    return {
      success: true,
      data: executionOutput,
      userFacingMessage: 'Tindakan AI berhasil dijalankan.'
    };

  } catch (err: any) {
    decision = 'DENIED';
    let userMsg = 'Maaf, terjadi kesalahan saat memproses permintaan.';

    if (err instanceof SecurityAuthorizationError) {
      denialCode = err.code;
      denialReason = err.internalReason;
      userMsg = err.userFacingMessage;
    } else {
      denialCode = 'TOOL_NOT_ALLOWED';
      denialReason = err?.message || 'Unknown execution failure';
    }

    // Step 12: Write Audit Log (DENIED/ERROR)
    logAIAuditEntry({
      userId: session?.userId || 'UNAUTHENTICATED',
      role: session?.role || 'PUBLIC',
      sessionId: session?.sessionId || 'NO_SESSION',
      action: toolName,
      tool: toolName,
      resourceId: resourceOwnerId || params?.id || 'N/A',
      result: 'DENIED',
      decision: 'BLOCKED_NO_PERMISSION',
      deniedReason: `${denialCode}: ${denialReason}`
    });

    return {
      success: false,
      userFacingMessage: userMsg,
      denialCode
    };
  }
}
