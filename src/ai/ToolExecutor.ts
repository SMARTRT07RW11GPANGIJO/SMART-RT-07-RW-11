// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8I TOOL EXECUTOR ENGINE
import { AIToolDefinition, ToolExecutionContext, ToolExecutionResult, AuthoritativeSession } from '../types/aiTools';
import { getAIToolDefinition } from './AIToolRegistry';
import { hasPermission, sanitizeDataForAI, logAIAuditEntry } from '../services/aiAuthorizationService';
import { executeDataTool } from '../dal/DataAccessLayer';
import { checkPromptSafety } from '../services/aiAssistantService';
import { AuditLogger } from '../services/auditLoggerService';

// In-Memory Rate Limit Tracker per session/ip
const RATE_LIMIT_CACHE: Record<string, { count: number; windowStart: number }> = {};

export class ToolExecutor {
  /**
   * Central Tool Execution Pipeline
   */
  public static async executeTool(
    toolId: string,
    args: Record<string, any> = {},
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const timestamp = new Date().toISOString();
    const session = context.session;

    // 1. Validate Session Authentication
    if (!session || !session.isValidSession || session.isExpired || session.isRevoked) {
      logAIAuditEntry({
        userId: session?.userId || 'UNAUTHENTICATED',
        role: session?.role || 'PUBLIC',
        sessionId: session?.sessionId || 'NO-SESS',
        action: 'EXECUTE_TOOL_AUTH_CHECK',
        tool: toolId,
        result: 'DENIED',
        decision: 'BLOCKED_INVALID_SESSION',
        deniedReason: 'Sesi pengakses tidak valid atau sudah kedaluwarsa.'
      });

      return {
        success: false,
        status: 'DENIED',
        toolId,
        error: 'Akses Ditolak: Sesi Anda tidak valid. Silakan melakukan otentikasi ulang.'
      };
    }

    // 2. Validate Tool Existence
    const tool = getAIToolDefinition(toolId);
    if (!tool) {
      logAIAuditEntry({
        userId: session.userId,
        role: session.role,
        sessionId: session.sessionId,
        action: 'TOOL_VALIDATION',
        tool: toolId,
        result: 'ERROR',
        decision: 'BLOCKED_TOOL_NOT_FOUND',
        deniedReason: `Tool dengan ID '${toolId}' tidak terdaftar di Tool Registry.`
      });

      return {
        success: false,
        status: 'ERROR',
        toolId,
        error: `Tool '${toolId}' tidak ditemukan dalam registry resmi.`
      };
    }

    // 3. Prompt Guardrail & Anti-Injection Verification
    if (context.userPrompt) {
      const safety = checkPromptSafety(context.userPrompt);
      if (!safety.safe) {
        logAIAuditEntry({
          userId: session.userId,
          role: session.role,
          sessionId: session.sessionId,
          action: 'PROMPT_INJECTION_CHECK',
          tool: toolId,
          result: 'DENIED',
          decision: 'BLOCKED_PROMPT_INJECTION',
          deniedReason: safety.reason
        });

        return {
          success: false,
          status: 'DENIED',
          toolId,
          riskLevel: 'CRITICAL',
          error: `Serangan Keamanan Terdeteksi: ${safety.reason}`
        };
      }
    }

    // 4. Rate Limiting Enforcement
    const rateLimitKey = `${session.userId}:${toolId}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    if (!RATE_LIMIT_CACHE[rateLimitKey]) {
      RATE_LIMIT_CACHE[rateLimitKey] = { count: 1, windowStart: now };
    } else {
      if (now - RATE_LIMIT_CACHE[rateLimitKey].windowStart > windowMs) {
        RATE_LIMIT_CACHE[rateLimitKey] = { count: 1, windowStart: now };
      } else {
        RATE_LIMIT_CACHE[rateLimitKey].count++;
        if (RATE_LIMIT_CACHE[rateLimitKey].count > tool.rateLimit) {
          logAIAuditEntry({
            userId: session.userId,
            role: session.role,
            sessionId: session.sessionId,
            action: 'RATE_LIMIT_CHECK',
            tool: toolId,
            result: 'DENIED',
            decision: 'BLOCKED_RATE_LIMITED',
            deniedReason: `Melebihi batas ${tool.rateLimit} pemanggilan per menit.`
          });

          return {
            success: false,
            status: 'RATE_LIMITED',
            toolId,
            error: `Batas kecepatan pemanggilan tool '${toolId}' terlampaui (${tool.rateLimit}/menit). Silakan tunggu sebentar.`
          };
        }
      }
    }

    // 5. Server-Side Role & Permission Authorization
    const roleAllowed = tool.allowedRoles.includes(session.role);
    const permAllowed = hasPermission(session.role, tool.permission);

    if (!roleAllowed || !permAllowed) {
      const reason = `Role ${session.role} tidak memiliki hak akses '${tool.permission}' untuk tool '${toolId}'.`;
      logAIAuditEntry({
        userId: session.userId,
        role: session.role,
        sessionId: session.sessionId,
        action: 'AUTHORIZATION_CHECK',
        tool: toolId,
        result: 'DENIED',
        decision: 'BLOCKED_NO_PERMISSION',
        deniedReason: reason
      });

      return {
        success: false,
        status: 'DENIED',
        toolId,
        error: `Akses Ditolak: ${reason}`
      };
    }

    // 6. SELF DATA PROTECTION — Forged ResidentId Neutralization
    // Never trust residentId supplied by AI/client arguments for self-service tools!
    const sanitizedArgs = { ...args };
    if (tool.requiresOwnership) {
      // Force authoritative residentId from authenticated session!
      sanitizedArgs.residentId = session.residentId || session.userId;
      sanitizedArgs.userId = session.userId;
      sanitizedArgs.id_warga = session.residentId || session.userId;
    }

    // 7. Input Schema Validation
    if (tool.inputSchema.required) {
      for (const requiredKey of tool.inputSchema.required) {
        if (sanitizedArgs[requiredKey] === undefined || sanitizedArgs[requiredKey] === null || sanitizedArgs[requiredKey] === '') {
          logAIAuditEntry({
            userId: session.userId,
            role: session.role,
            sessionId: session.sessionId,
            action: 'SCHEMA_VALIDATION',
            tool: toolId,
            result: 'ERROR',
            decision: 'BLOCKED_MALFORMED_SCHEMA',
            deniedReason: `Argumen wajib '${requiredKey}' tidak disediakan.`
          });

          return {
            success: false,
            status: 'ERROR',
            toolId,
            error: `Skema Tidak Valid: Argumen '${requiredKey}' wajib diisi untuk menjalankan ${toolId}.`
          };
        }
      }
    }

    // 8. Risk Engine & Human Confirmation Intercept
    // Require confirmation if tool.confirmationRequired === true AND context.confirmed !== true
    if (tool.confirmationRequired && !context.confirmed) {
      const confirmId = `CONF-${toolId}-${Date.now()}`;
      logAIAuditEntry({
        userId: session.userId,
        role: session.role,
        sessionId: session.sessionId,
        action: 'TOOL_CONFIRMATION_REQUIRED',
        tool: toolId,
        result: 'DENIED',
        decision: 'CONFIRMATION_INTERCEPTED',
        deniedReason: `Tindakan berisiko (${tool.riskLevel}) membutuhkan konfirmasi eksplisit dari pengguna.`
      });

      return {
        success: true,
        status: 'CONFIRMATION_REQUIRED',
        toolId,
        riskLevel: tool.riskLevel,
        confirmationPrompt: {
          id: confirmId,
          title: `Konfirmasi Tindakan: ${tool.name}`,
          description: `Sistem AI memerlukan konfirmasi eksplisit dari Anda untuk mengeksekusi '${tool.description}'. Apakah Anda yakin ingin melanjutkan?`,
          payload: sanitizedArgs
        }
      };
    }

    // 9. Execute Tool via DAL & Business Services
    try {
      logAIAuditEntry({
        userId: session.userId,
        role: session.role,
        sessionId: session.sessionId,
        action: 'TOOL_EXECUTING',
        tool: toolId,
        result: 'SUCCESS',
        decision: 'EXECUTING_DAL'
      });

      // Execute DAL Function
      const dalResult = executeDataTool(toolId, {
        sessionId: session.sessionId,
        userId: session.userId,
        role: session.role,
        isValid: true
      }, sanitizedArgs);

      if (!dalResult.success) {
        logAIAuditEntry({
          userId: session.userId,
          role: session.role,
          sessionId: session.sessionId,
          action: 'TOOL_EXECUTION_FAILED',
          tool: toolId,
          result: 'ERROR',
          decision: 'DAL_ERROR',
          deniedReason: (dalResult as any).error || (dalResult as any).message || dalResult.code
        });

        return {
          success: false,
          status: 'ERROR',
          toolId,
          error: (dalResult as any).error || (dalResult as any).message || `Gagal mengeksekusi tool ${toolId}`
        };
      }

      // 10. Sanitize Output Data
      const sanitizedOutput = sanitizeDataForAI(dalResult.data);

      AuditLogger.log({
        userId: session.userId,
        role: session.role,
        sessionId: session.sessionId,
        action: 'AI_TOOL_EXECUTED',
        toolName: toolId,
        riskLevel: tool.riskLevel,
        authorization: 'ALLOWED',
        status: 'SUCCESS',
        durationMs: 35,
        details: `Tool ${toolId} executed successfully.`
      });

      const auditRecord = logAIAuditEntry({
        userId: session.userId,
        role: session.role,
        sessionId: session.sessionId,
        action: 'TOOL_EXECUTED_SUCCESS',
        tool: toolId,
        result: 'SUCCESS',
        decision: 'EXECUTED'
      });

      return {
        success: true,
        status: 'EXECUTED',
        toolId,
        riskLevel: tool.riskLevel,
        data: sanitizedOutput,
        auditLogId: auditRecord.id
      };
    } catch (err: any) {
      logAIAuditEntry({
        userId: session.userId,
        role: session.role,
        sessionId: session.sessionId,
        action: 'TOOL_UNHANDLED_EXCEPTION',
        tool: toolId,
        result: 'ERROR',
        decision: 'CRASH',
        deniedReason: err.message
      });

      return {
        success: false,
        status: 'ERROR',
        toolId,
        error: `Kesalahan Internal saat mengeksekusi ${toolId}: ${err.message}`
      };
    }
  }
}
