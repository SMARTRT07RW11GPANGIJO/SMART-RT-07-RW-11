# ADMIN OFFBOARDING GUIDE

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-GUIDE-OFFBOARDING` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## Administrator Offboarding Procedure

Goal: Ensure clean access revocation, prevent credential leakage, and maintain operational continuity when an administrator resigns, completes their term, or transfers duties.

---

## 8-Step Offboarding Protocol

1. **Step 1: Disable Account & Revoke Active Sessions**
   - In Control Center (9J), invalidate all active session tokens associated with the offboarding user.
   - Set account status to `INACTIVE`.
2. **Step 2: Transfer Administrative Rights & Ownership**
   - Re-assign active pending approvals and tickets to the incoming Administrator or Ketua RT.
3. **Step 3: Rotate Shared System Secrets**
   - Rotate `GAS_SHARED_SECRET`, `WHATSAPP_API_TOKEN`, and `GEMINI_API_KEY` in server environment variables.
4. **Step 4: Update Google Drive & Sheets Access Rights**
   - Remove offboarding user's Google account from Google Sheets Database and Drive Folder Editor permissions.
5. **Step 5: Verify System Backups**
   - Run an on-demand backup snapshot to confirm data integrity before offboarding completes.
6. **Step 6: Audit Access Logs**
   - Review Audit Trail (`AuditLog`) for any unverified actions taken prior to offboarding.
7. **Step 7: Update Documentation & Contact Lists**
   - Update `EMERGENCY_CONTACTS.md` and Maintainer lists in System Documentation.
8. **Step 8: Final Security Sign-off**
   - Log offboarding completion event to Audit Trail.
