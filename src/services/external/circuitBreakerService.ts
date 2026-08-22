// SMART RT 07 RW 11 GPA NGIJO - CIRCUIT BREAKER & RESILIENCE SERVICE v1.0
// Module: SMART RT EXTERNAL SERVICE INTEGRATION v1.0 (CR-SMART-RT-EXTERNAL-001)

import { 
  ExternalServiceType, 
  CircuitBreakerState, 
  ServiceCircuitBreaker,
  IntegrationHealthStatus 
} from '../../types/externalIntegration';

export class CircuitBreakerService {
  private static breakers: Map<ExternalServiceType, ServiceCircuitBreaker> = new Map([
    [
      'GAS_SHEETS',
      {
        service: 'GAS_SHEETS',
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        lastStateChange: Date.now(),
        failureThreshold: 3, // 3 consecutive failures
        resetTimeoutMs: 30000 // 30s before half-open probe
      }
    ],
    [
      'WHATSAPP_GATEWAY',
      {
        service: 'WHATSAPP_GATEWAY',
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        lastStateChange: Date.now(),
        failureThreshold: 3,
        resetTimeoutMs: 30000
      }
    ],
    [
      'GEMINI_AI',
      {
        service: 'GEMINI_AI',
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        lastStateChange: Date.now(),
        failureThreshold: 3,
        resetTimeoutMs: 30000
      }
    ],
    [
      'OSM_MAP',
      {
        service: 'OSM_MAP',
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        lastStateChange: Date.now(),
        failureThreshold: 5,
        resetTimeoutMs: 15000
      }
    ]
  ]);

  /**
   * Check if a request is allowed to execute through the circuit breaker
   */
  static canExecute(service: ExternalServiceType): boolean {
    const cb = this.breakers.get(service);
    if (!cb) return true;

    if (cb.state === 'CLOSED') {
      return true;
    }

    if (cb.state === 'OPEN') {
      const now = Date.now();
      if (now - cb.lastStateChange >= cb.resetTimeoutMs) {
        // Transition to HALF_OPEN to attempt canary request
        cb.state = 'HALF_OPEN';
        cb.lastStateChange = now;
        return true;
      }
      return false; // Fast-fail when OPEN
    }

    if (cb.state === 'HALF_OPEN') {
      return true; // Allow single trial request
    }

    return true;
  }

  /**
   * Record a successful external call
   */
  static recordSuccess(service: ExternalServiceType): void {
    const cb = this.breakers.get(service);
    if (!cb) return;

    cb.successCount++;
    cb.lastSuccessTime = Date.now();

    if (cb.state === 'HALF_OPEN') {
      // Recovery successful -> close breaker
      cb.state = 'CLOSED';
      cb.failureCount = 0;
      cb.lastStateChange = Date.now();
    } else if (cb.state === 'CLOSED') {
      cb.failureCount = 0;
    }
  }

  /**
   * Record a failed external call
   */
  static recordFailure(service: ExternalServiceType): void {
    const cb = this.breakers.get(service);
    if (!cb) return;

    cb.failureCount++;
    cb.lastFailureTime = Date.now();

    if (cb.state === 'HALF_OPEN') {
      // Failed in canary test -> trip back to OPEN
      cb.state = 'OPEN';
      cb.lastStateChange = Date.now();
    } else if (cb.state === 'CLOSED') {
      if (cb.failureCount >= cb.failureThreshold) {
        cb.state = 'OPEN';
        cb.lastStateChange = Date.now();
      }
    }
  }

  /**
   * Execute an async external call wrapped with timeout (max 5s), retry (max 2 with exp backoff),
   * and circuit breaker enforcement.
   */
  static async executeWithResilience<T>(
    service: ExternalServiceType,
    fn: () => Promise<T>,
    fallback: T,
    timeoutMs: number = 5000,
    maxRetries: number = 2
  ): Promise<{ data: T; isDegraded: boolean; error?: string }> {
    if (!this.canExecute(service)) {
      return {
        data: fallback,
        isDegraded: true,
        error: `Layanan ${service} sementara offline (Circuit Breaker OPEN).`
      };
    }

    let attempt = 0;
    let lastErrorMsg = '';

    while (attempt <= maxRetries) {
      try {
        // Timeout race
        const result = await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED_5S')), timeoutMs)
          )
        ]);

        this.recordSuccess(service);
        return {
          data: result,
          isDegraded: false
        };
      } catch (err: any) {
        attempt++;
        lastErrorMsg = err?.message || 'UNKNOWN_EXTERNAL_ERROR';

        if (attempt <= maxRetries) {
          // Exponential backoff: 300ms, 600ms
          const delay = Math.min(300 * Math.pow(2, attempt - 1), 2000);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }

    // All retries exhausted
    this.recordFailure(service);
    return {
      data: fallback,
      isDegraded: true,
      error: `Layanan ${service} gagal setelah ${maxRetries} percobaan: ${lastErrorMsg}`
    };
  }

  /**
   * Retrieve circuit breaker metrics for dashboard monitoring
   */
  static getBreakerState(service: ExternalServiceType): ServiceCircuitBreaker | undefined {
    return this.breakers.get(service);
  }

  /**
   * Get health status enumeration
   */
  static getHealthStatus(service: ExternalServiceType, isEnabled: boolean): IntegrationHealthStatus {
    if (!isEnabled) return 'DISABLED';
    const cb = this.breakers.get(service);
    if (!cb) return 'HEALTHY';

    if (cb.state === 'OPEN') return 'OFFLINE';
    if (cb.state === 'HALF_OPEN' || cb.failureCount > 0) return 'DEGRADED';
    return 'HEALTHY';
  }

  /**
   * Manually reset circuit breaker (Admin only)
   */
  static resetBreaker(service: ExternalServiceType): void {
    const cb = this.breakers.get(service);
    if (cb) {
      cb.state = 'CLOSED';
      cb.failureCount = 0;
      cb.lastStateChange = Date.now();
    }
  }
}
