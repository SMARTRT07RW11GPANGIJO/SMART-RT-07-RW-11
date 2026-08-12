# 04 — AUTHENTICATION DOCUMENTATION

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-04-AUTHENTICATION` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## 1. Authentication Overview

The SMART RT platform enforces session-based client and server authentication. Users sign in using registered credentials (Username / Email + Password) or via phone number verification for Warga.

---

## 2. Authentication Flow

```text
User Input (Email / No HP + Password)
          │
          ▼
Validate Credentials (BCrypt Hash Comparison)
          │
          ▼
Credential Match? ──► NO ──► Increment Failed Login Counter ──► Lock Account if >= 5
          │
         YES
          ▼
Generate Session Token (UUID v4 + Expiration Timestamp)
          │
          ▼
Resolve UserRole (ADMIN, KETUA_RT, PENGURUS, WARGA, PUBLIC)
          │
          ▼
Store Session in Local Storage & Memory
          │
          ▼
Log SUCCESS Event to Audit Trail
```

---

## 3. Session & Security Policies

1. **Session Timeout**: 8 Hours of inactivity automatically invalidates session.
2. **Re-Authentication Policy**: Critical administrative actions (e.g. Rollback Release, Enable Maintenance Mode, Reset Database) require re-entering administrative credentials.
3. **Account Lockout Rule**: 5 consecutive failed login attempts lock account for 15 minutes.
4. **Rate Limiting**: Maximum 10 login requests per minute per IP address.
5. **Password Policy**:
   - Minimum 8 characters
   - Must contain uppercase letter, lowercase letter, number, and special character.
   - Forced rotation every 90 days for `ADMIN` and `KETUA_RT`.

---

## 4. Secret & Credential Safety Rule

**CRITICAL**: Plaintext passwords, API keys, tokens, or hashes MUST NEVER be logged or stored in version control repository files.

Secrets are stored in environment variables:
- `GEMINI_API_KEY`: `[REDACTED]`
- `WHATSAPP_API_TOKEN`: `[REDACTED]`
- `GAS_SHARED_SECRET`: `[REDACTED]`
