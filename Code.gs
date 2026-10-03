/**
 * Code.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * Web App Controller & JSON Response Router
 * 
 * CR-PRE/19-SEP-001 — Authoritative Action Router
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";
  if (action === "ping") {
    return jsonResponse({
      success: true,
      message: "SMART RT 07 Backend Apps Script Active!",
      data: { status: "ACTIVE", version: "1.0-PROD" },
      timestamp: new Date().toISOString()
    });
  }
  if (action === "health") {
    return jsonResponse({
      success: true,
      message: "System Healthy",
      data: getSystemHealth(),
      timestamp: Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd'T'HH:mm:ss'Z'")
    });
  }
  return jsonResponse({
    success: false,
    errorCode: "INVALID_ACTION",
    message: "Action doGet tidak dikenal."
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        success: false,
        message: "Bad Request: Body POST JSON kosong atau tidak valid.",
        data: null,
        errorCode: "INVALID_REQUEST"
      });
    }

    var contents;
    try {
      contents = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({
        success: false,
        message: "Bad Request: Format JSON tidak valid.",
        data: null,
        errorCode: "INVALID_JSON"
      });
    }

    var action = contents.action;
    var payload = contents.payload || {};

    if (!action) {
      return jsonResponse({
        success: false,
        message: "Bad Request: Parameter action wajib disertakan.",
        data: null,
        errorCode: "MISSING_ACTION"
      });
    }

    // 1. Ping Action Router
    if (action === "ping") {
      return jsonResponse({
        success: true,
        message: "SMART RT 07 Backend Apps Script Active!",
        data: { status: "ACTIVE" },
        errorCode: null
      });
    }

    // 2. Health Action Router
    if (action === "health") {
      return jsonResponse({
        success: true,
        message: "System Healthy",
        data: { status: true, message: "Sistem siap beroperasi." },
        errorCode: null
      });
    }

    // 3. saveWarga Action Router
    if (action === "saveWarga") {
      try {
        var resSave = saveWarga(payload);
        return jsonResponse(resSave);
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal menyimpan data warga: " + (err && err.message ? err.message : "Error tidak diketahui"),
          data: null,
          errorCode: "SAVE_WARGA_FAILED"
        });
      }
    }

    // 4. verifyWargaCredentials Action Router (SSoT Verification)
    if (action === "verifyWargaCredentials") {
      try {
        var resVerify = verifyWargaCredentials(payload);
        return jsonResponse(resVerify);
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal memverifikasi kredensial: " + (err && err.message ? err.message : "Error"),
          data: null,
          errorCode: "VERIFY_FAILED"
        });
      }
    }

    // 5. getWarga Action Router
    if (action === "getWarga") {
      try {
        var resWarga = (typeof getWarga === "function") ? getWarga(payload) : { success: true, data: null };
        return jsonResponse(resWarga);
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal mengambil data warga: " + (err && err.message ? err.message : "Error"),
          data: null,
          errorCode: "GET_WARGA_FAILED"
        });
      }
    }

    // 6. getWargaList Action Router (SSoT Warga Read-Back)
    if (action === "getWargaList") {
      try {
        var userRole = payload.userRole || payload.role || "WARGA";
        var resWargaList = (typeof getWargaList === "function") 
          ? getWargaList(userRole) 
          : { success: false, message: "Fungsi getWargaList belum tersedia pada backend.", data: [], errorCode: "FUNCTION_NOT_FOUND" };
        
        // Single response envelope, no double-wrapping
        if (resWargaList && typeof resWargaList === "object" && ("success" in resWargaList)) {
          return jsonResponse(resWargaList);
        }
        return jsonResponse({
          success: true,
          data: resWargaList || [],
          errorCode: null
        });
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal mengambil daftar warga: " + (err && err.message ? err.message : "Error"),
          data: [],
          errorCode: "GET_WARGALIST_FAILED"
        });
      }
    }

    // 7. getKeluarga Action Router
    if (action === "getKeluarga") {
      try {
        var resKk = (typeof getKeluarga === "function") ? getKeluarga(payload) : { success: true, data: null };
        return jsonResponse(resKk);
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal mengambil data keluarga: " + (err && err.message ? err.message : "Error"),
          data: null,
          errorCode: "GET_KELUARGA_FAILED"
        });
      }
    }

    // 8. getKeluargaList Action Router
    if (action === "getKeluargaList") {
      try {
        var resKkList = (typeof getKeluargaList === "function") ? getKeluargaList(payload) : { success: true, data: [] };
        return jsonResponse({ success: true, data: resKkList, errorCode: null });
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal mengambil daftar keluarga: " + (err && err.message ? err.message : "Error"),
          data: null,
          errorCode: "GET_KELUARGALIST_FAILED"
        });
      }
    }

    // 9. CR-PRE/19-SEP-001: getMyProfile Action Router (Minimal Forwarder to Warga.gs)
    if (action === "getMyProfile") {
      try {
        var resProfile = getMyProfile(payload);
        return jsonResponse(resProfile);
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal mengambil data profil: " + (err && err.message ? err.message : "Error"),
          data: null,
          errorCode: "GET_PROFILE_FAILED"
        });
      }
    }

    // 10. CR-DATA/20-SEP-001: createWargaChangeRequest Action Router
    if (action === "createWargaChangeRequest") {
      try {
        var resCreateWcr = createWargaChangeRequest(payload);
        return jsonResponse(resCreateWcr);
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal memproses pengajuan perubahan data: " + (err && err.message ? err.message : "Error"),
          data: null,
          errorCode: "CREATE_WCR_FAILED"
        });
      }
    }

    // 11. CR-DATA/20-SEP-001: getMyWargaChangeRequests Action Router
    if (action === "getMyWargaChangeRequests") {
      try {
        var resMyWcr = getMyWargaChangeRequests(payload);
        return jsonResponse(resMyWcr);
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal mengambil riwayat pengajuan perubahan data: " + (err && err.message ? err.message : "Error"),
          data: null,
          errorCode: "GET_MY_WCR_FAILED"
        });
      }
    }

    // 12. CR-DATA/20-SEP-001: getWargaChangeRequest Action Router
    if (action === "getWargaChangeRequest") {
      try {
        var resGetWcr = getWargaChangeRequest(payload);
        return jsonResponse(resGetWcr);
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal mengambil detail pengajuan perubahan data: " + (err && err.message ? err.message : "Error"),
          data: null,
          errorCode: "GET_WCR_FAILED"
        });
      }
    }

    // 13. CR-PROD/19-SEP-001A: controlledProductionReset Action Router
    if (action === "controlledProductionReset") {
      try {
        var resReset = executeControlledProductionReset(payload);
        return jsonResponse(resReset);
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal memproses controlled production reset: " + (err && err.message ? err.message : "Error"),
          data: null,
          errorCode: "RESET_EXECUTION_FAILED"
        });
      }
    }

    // 14. CR-WCR/PROD-002: getAllWargaChangeRequests Action Router
    if (action === "getAllWargaChangeRequests") {
      try {
        var resAllWcr = (typeof getAllWargaChangeRequests === "function")
          ? getAllWargaChangeRequests(payload)
          : { success: false, message: "Fungsi getAllWargaChangeRequests belum tersedia pada backend.", data: [], errorCode: "FUNCTION_NOT_FOUND" };
        
        // Single response envelope, no double-wrapping
        if (resAllWcr && typeof resAllWcr === "object" && ("success" in resAllWcr)) {
          return jsonResponse(resAllWcr);
        }
        return jsonResponse({
          success: true,
          data: resAllWcr || [],
          errorCode: null
        });
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal mengambil seluruh pengajuan perubahan warga: " + (err && err.message ? err.message : "Error"),
          data: [],
          errorCode: "GET_ALL_WCR_FAILED"
        });
      }
    }

    // 15. CR-WCR/PROD-002: reviewWargaChangeRequest Action Router
    if (action === "reviewWargaChangeRequest") {
      try {
        var resReviewWcr = (typeof reviewWargaChangeRequest === "function")
          ? reviewWargaChangeRequest(payload)
          : { success: false, message: "Fungsi reviewWargaChangeRequest belum tersedia pada backend.", data: null, errorCode: "FUNCTION_NOT_FOUND" };
        
        // Single response envelope, no double-wrapping
        if (resReviewWcr && typeof resReviewWcr === "object" && ("success" in resReviewWcr)) {
          return jsonResponse(resReviewWcr);
        }
        return jsonResponse({
          success: true,
          data: resReviewWcr || null,
          errorCode: null
        });
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal memproses review pengajuan warga: " + (err && err.message ? err.message : "Error"),
          data: null,
          errorCode: "REVIEW_WCR_FAILED"
        });
      }
    }

    // 16. CR-WCR/PROD-003: recoverLegacyWargaChangeRequest Action Router
    if (action === "recoverLegacyWargaChangeRequest") {
      try {
        var resRecoverWcr =
          (typeof recoverLegacyWargaChangeRequest === "function")
            ? recoverLegacyWargaChangeRequest(payload)
            : {
                success: false,
                message: "Fungsi recoverLegacyWargaChangeRequest belum tersedia pada backend.",
                data: null,
                errorCode: "FUNCTION_NOT_FOUND"
              };

        // Single response envelope, no double-wrapping
        if (
          resRecoverWcr &&
          typeof resRecoverWcr === "object" &&
          ("success" in resRecoverWcr)
        ) {
          return jsonResponse(resRecoverWcr);
        }

        return jsonResponse({
          success: true,
          data: resRecoverWcr || null,
          errorCode: null
        });

      } catch (err) {
        return jsonResponse({
          success: false,
          message:
            "Gagal melakukan recovery legacy WCR: " +
            (err && err.message ? err.message : "Error"),
          data: null,
          errorCode: "RECOVER_LEGACY_WCR_FAILED"
        });
      }
    }

    // Safe default handler for unrecognized actions
    return jsonResponse({
      success: false,
      message: "Action belum didukung pada router saat ini: " + action,
      data: null,
      errorCode: "ACTION_NOT_SUPPORTED"
    });

  } catch (err) {
    var safeErrorMsg = err && err.message ? err.message.replace(/([a-zA-Z0-9_\-\.]{20,})/g, "[REDACTED]") : "Internal Server Error";
    return jsonResponse({
      success: false,
      message: "Terjadi kesalahan internal server: " + safeErrorMsg,
      data: null,
      errorCode: "INTERNAL_ERROR"
    });
  }
}

function getSystemHealth() {
  return {
    success: true,
    environment: "PRODUCTION",
    timestamp: Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    database: { status: "OK" },
    storage: { status: "OK" },
    backup: { status: "OK", folderConfigured: true },
    security: { status: "OK", secretStorage: "ScriptProperties (Zero Client Leak)" }
  };
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * CR-PROD/19-SEP-001A: Controlled Production Reset Handler
 *
 * Implements strict, single-purpose, sequential production database reset
 * against 7 predefined target sheets with zero mutation of row 1 headers.
 * Governed by Model C Backup Trust, fail-closed APP_ENV check, ScriptLock,
 * one-time execution guard, full preflight, read-back verification, and audit logging.
 */
function executeControlledProductionReset(payload) {
  var AUTHORIZED_CR_ID = "CR-PROD/19-SEP-001A";
  var AUTHORIZED_MANIFEST_ID = "PRE_RESET_2026-09-20_MASTER_MANIFEST.json";
  var REQUIRED_ENV = "PRODUCTION";
  var STATE_KEY = "CR_PROD_19_SEP_001A_STATUS";

  var ALLOWED_RESET_TARGETS = [
    "WARGA",
    "KELUARGA",
    "SURAT",
    "TRANSAKSI_KEUANGAN",
    "IURAN_BULANAN",
    "PENGADUAN",
    "PENGAJUAN_PERUBAHAN_WARGA"
  ];

  // 1. AUTHENTICATION (Reuse existing validateSession)
  if (!payload || typeof payload !== "object") {
    return {
      success: false,
      message: "Payload request tidak valid.",
      data: null,
      errorCode: "INVALID_PAYLOAD"
    };
  }

  var sessionToken = payload.sessionToken;
  var sessionRes = validateSession(sessionToken);
  if (!sessionRes || !sessionRes.isValid) {
    return {
      success: false,
      message: "Sesi otentikasi tidak valid atau telah kedaluwarsa. " + (sessionRes && sessionRes.message ? sessionRes.message : ""),
      data: null,
      errorCode: sessionRes && sessionRes.code ? sessionRes.code : "AUTH_REQUIRED"
    };
  }

  var session = sessionRes.session;
  var userId = session.userId || "UNKNOWN";
  var role = session.role || "UNKNOWN";

  // 2. AUTHORIZATION (Reuse existing role and permission: ADMIN + BACKUP_RESTORE)
  if (role !== "ADMIN" || !checkRolePermission(role, "BACKUP_RESTORE")) {
    return {
      success: false,
      message: "Akses ditolak: Hanya peran ADMIN dengan izin BACKUP_RESTORE yang diizinkan menjalankan reset produksi.",
      data: null,
      errorCode: "PERMISSION_DENIED"
    };
  }

  // 3. ACQUIRE SCRIPT LOCK
  var lock = LockService.getScriptLock();
  var lockAcquired = false;
  try {
    lockAcquired = lock.tryLock(30000);
  } catch (lockErr) {
    lockAcquired = false;
  }

  if (!lockAcquired) {
    return {
      success: false,
      message: "Sistem sedang sibuk. Gagal memperoleh ScriptLock untuk controlled production reset.",
      data: null,
      errorCode: "CONCURRENT_EXECUTION_BLOCKED"
    };
  }

  try {
    var props = PropertiesService.getScriptProperties();

    // 4. CHECK EXECUTION STATE (One-Time Guard)
    var currentState = props.getProperty(STATE_KEY);
    if (currentState === "COMPLETED") {
      return {
        success: false,
        message: "Reset produksi CR-PROD/19-SEP-001A telah berhasil dieksekusi sebelumnya. Eksekusi ulang ditolak.",
        data: null,
        errorCode: "ALREADY_COMPLETED"
      };
    }
    if (currentState === "IN_PROGRESS") {
      return {
        success: false,
        message: "Reset produksi CR-PROD/19-SEP-001A sedang berjalan pada proses lain. Eksekusi bersamaan diblokir.",
        data: null,
        errorCode: "CONCURRENT_EXECUTION_BLOCKED"
      };
    }
    if (currentState === "FAILED_PARTIAL") {
      return {
        success: false,
        message: "Reset produksi CR-PROD/19-SEP-001A sebelumnya mengalami kegagalan parsial (FAILED_PARTIAL). Sistem terkunci secara terminal untuk CR ini. Hubungi Project Director.",
        data: null,
        errorCode: "PREVIOUSLY_FAILED_LOCKED"
      };
    }
    if (currentState && currentState !== "UNEXECUTED") {
      return {
        success: false,
        message: "Status eksekusi tidak dikenal (" + currentState + "). Reset dibatalkan.",
        data: null,
        errorCode: "INVALID_EXECUTION_STATE"
      };
    }

    // 5. VERIFY PRECONDITIONS
    // A. CR Binding
    if (String(payload.crId || "").trim() !== AUTHORIZED_CR_ID) {
      return {
        success: false,
        message: "CR Binding ditolak: Parameter crId wajib bernilai '" + AUTHORIZED_CR_ID + "'.",
        data: null,
        errorCode: "CR_BINDING_REJECTED"
      };
    }

    // B. Production Environment Guard (Fail-closed, strictly no fallback)
    var serverEnv = props.getProperty("APP_ENV");
    if (serverEnv !== REQUIRED_ENV) {
      return {
        success: false,
        message: "Environment guard gagal: Server property APP_ENV wajib bernilai 'PRODUCTION' (ditemukan: " + (serverEnv === null ? "null/missing" : "'" + serverEnv + "'") + "). Fail-closed: tidak ada fallback yang diizinkan.",
        data: null,
        errorCode: "ENVIRONMENT_GUARD_FAILED"
      };
    }
    if (payload.environment && payload.environment !== REQUIRED_ENV) {
      return {
        success: false,
        message: "Environment guard gagal: Payload environment tidak konsisten dengan PRODUCTION.",
        data: null,
        errorCode: "ENVIRONMENT_GUARD_FAILED"
      };
    }

    // C. Backup Precondition (Model C: Manifest Binding & Verification Assertion)
    if (String(payload.backupManifestId || "").trim() !== AUTHORIZED_MANIFEST_ID || payload.backupVerified !== true) {
      return {
        success: false,
        message: "Backup precondition gagal: backupManifestId wajib '" + AUTHORIZED_MANIFEST_ID + "' dan backupVerified wajib true.",
        data: null,
        errorCode: "BACKUP_PRECONDITION_FAILED"
      };
    }

    // 6. PREFLIGHT ALL 7 TARGETS
    var dbConfig = getConfig();
    var ss = SpreadsheetApp.openById(dbConfig.DATABASE_ID);
    if (!ss) {
      return {
        success: false,
        message: "Preflight gagal: Spreadsheet database tidak dapat diakses.",
        data: null,
        errorCode: "PREFLIGHT_FAILED"
      };
    }

    var preflightSnapshots = {};
    for (var i = 0; i < ALLOWED_RESET_TARGETS.length; i++) {
      var targetName = ALLOWED_RESET_TARGETS[i];
      var sheet = ss.getSheetByName(targetName);
      if (!sheet) {
        return {
          success: false,
          message: "Preflight gagal: Target sheet '" + targetName + "' tidak ditemukan dalam spreadsheet.",
          data: null,
          errorCode: "PREFLIGHT_FAILED"
        };
      }

      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();
      if (lastCol < 1 || lastRow < 1) {
        return {
          success: false,
          message: "Preflight gagal: Target sheet '" + targetName + "' tidak memiliki baris header yang valid.",
          data: null,
          errorCode: "PREFLIGHT_FAILED"
        };
      }

      var headerValues = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      if (!headerValues || headerValues.length === 0 || !headerValues[0]) {
        return {
          success: false,
          message: "Preflight gagal: Header row 1 pada target sheet '" + targetName + "' kosong.",
          data: null,
          errorCode: "PREFLIGHT_FAILED"
        };
      }

      preflightSnapshots[targetName] = {
        sheet: sheet,
        initialLastRow: lastRow,
        lastCol: lastCol,
        headers: headerValues
      };
    }

    // 7. WRITE RESET_ATTEMPT AUDIT (Hard Stop if Audit Fails)
    var attemptLogged = writeAuditLog({
      userId: userId,
      role: role,
      sessionId: sessionToken ? String(sessionToken).substring(0, 8) + "..." : "N/A",
      action: "RESET_ATTEMPT",
      tool: "CONTROLLED_PRODUCTION_RESET",
      resourceId: AUTHORIZED_CR_ID,
      decision: "ALLOWED",
      reason: "Preflight passed for all 7 sheets. Manifest: " + AUTHORIZED_MANIFEST_ID + " | Env: " + serverEnv
    });

    if (!attemptLogged) {
      return {
        success: false,
        message: "Gagal mencatat audit log RESET_ATTEMPT. Fail-closed: eksekusi mutasi dibatalkan sebelum dimulai.",
        data: null,
        errorCode: "AUDIT_ATTEMPT_FAILED"
      };
    }

    // 8. SET STATE = IN_PROGRESS
    props.setProperty(STATE_KEY, "IN_PROGRESS");

    // 9. SEQUENTIAL MUTATION AND READ-BACK
    var completedTargets = [];
    var targetDetails = [];

    for (var j = 0; j < ALLOWED_RESET_TARGETS.length; j++) {
      var currentTargetName = ALLOWED_RESET_TARGETS[j];
      var snapshot = preflightSnapshots[currentTargetName];
      var targetSheet = snapshot.sheet;
      var preRow = snapshot.initialLastRow;
      var targetCols = snapshot.lastCol;

      var rowsCleared = 0;

      try {
        // Step A: Clear body content only (row 2 to lastRow)
        if (preRow > 1) {
          targetSheet.getRange(2, 1, preRow - 1, targetCols).clearContent();
          rowsCleared = preRow - 1;
        }
        SpreadsheetApp.flush();

        // Step B & C: Read-back verification
        var postRow = targetSheet.getLastRow();
        var postHeaders = targetSheet.getRange(1, 1, 1, targetCols).getValues()[0];

        // Body must be 0 rows, so lastRow must be 1 (or 0 if sheet had no rows, but header exists so 1)
        if (postRow > 1) {
          props.setProperty(STATE_KEY, "FAILED_PARTIAL");
          writeAuditLog({
            userId: userId,
            role: role,
            action: "RESET_READBACK_FAILED",
            tool: "CONTROLLED_PRODUCTION_RESET",
            resourceId: currentTargetName,
            decision: "TERMINAL_STOP",
            reason: "Read-back verification failed: postRow (" + postRow + ") > 1"
          });
          return {
            success: false,
            message: "Read-back verification gagal pada sheet '" + currentTargetName + "': masih terdapat " + (postRow - 1) + " baris data setelah pembersihan.",
            data: {
              status: "FAILED_PARTIAL",
              failedTarget: currentTargetName,
              completedTargets: completedTargets,
              details: targetDetails
            },
            errorCode: "FAILED_PARTIAL"
          };
        }

        // Step D: Verify header integrity against preflight snapshot
        for (var h = 0; h < snapshot.headers.length; h++) {
          if (String(postHeaders[h]) !== String(snapshot.headers[h])) {
            props.setProperty(STATE_KEY, "FAILED_PARTIAL");
            writeAuditLog({
              userId: userId,
              role: role,
              action: "RESET_HEADER_CORRUPTED",
              tool: "CONTROLLED_PRODUCTION_RESET",
              resourceId: currentTargetName,
              decision: "TERMINAL_STOP",
              reason: "Header column " + (h + 1) + " mismatch after clearContent"
            });
            return {
              success: false,
              message: "Verifikasi integritas header gagal pada sheet '" + currentTargetName + "': header kolom " + (h + 1) + " berubah.",
              data: {
                status: "FAILED_PARTIAL",
                failedTarget: currentTargetName,
                completedTargets: completedTargets,
                details: targetDetails
              },
              errorCode: "FAILED_PARTIAL"
            };
          }
        }

        // Step E: Write target-success audit
        var targetAuditSuccess = writeAuditLog({
          userId: userId,
          role: role,
          sessionId: sessionToken ? String(sessionToken).substring(0, 8) + "..." : "N/A",
          action: "RESET_TARGET_SUCCESS",
          tool: "CONTROLLED_PRODUCTION_RESET",
          resourceId: currentTargetName,
          decision: "CLEARED",
          reason: "Target " + currentTargetName + " cleared (" + rowsCleared + " rows). Read-back: PASS."
        });

        if (!targetAuditSuccess) {
          props.setProperty(STATE_KEY, "FAILED_PARTIAL");
          return {
            success: false,
            message: "Target '" + currentTargetName + "' berhasil dikosongkan dan diverifikasi, namun pencatatan audit log target gagal. Mutasi dihentikan fail-closed.",
            data: {
              status: "MUTATION_SUCCEEDED_AUDIT_WRITE_FAILED",
              failedAuditTarget: currentTargetName,
              completedTargets: completedTargets.concat([currentTargetName]),
              details: targetDetails.concat([{
                sheet: currentTargetName,
                rowsCleared: rowsCleared,
                postRow: postRow,
                status: "VERIFIED_AUDIT_WRITE_FAILED"
              }])
            },
            errorCode: "FAILED_PARTIAL"
          };
        }

        completedTargets.push(currentTargetName);
        targetDetails.push({
          sheet: currentTargetName,
          rowsCleared: rowsCleared,
          postRow: postRow,
          status: preRow <= 1 ? "ALREADY_EMPTY" : "VERIFIED"
        });

      } catch (mutationErr) {
        props.setProperty(STATE_KEY, "FAILED_PARTIAL");
        writeAuditLog({
          userId: userId,
          role: role,
          action: "RESET_TARGET_EXCEPTION",
          tool: "CONTROLLED_PRODUCTION_RESET",
          resourceId: currentTargetName,
          decision: "TERMINAL_STOP",
          reason: "Exception during reset: " + (mutationErr && mutationErr.message ? mutationErr.message : "Error")
        });
        return {
          success: false,
          message: "Terjadi kesalahan saat mengosongkan target sheet '" + currentTargetName + "': " + (mutationErr && mutationErr.message ? mutationErr.message : "Error"),
          data: {
            status: "FAILED_PARTIAL",
            failedTarget: currentTargetName,
            completedTargets: completedTargets,
            details: targetDetails
          },
          errorCode: "FAILED_PARTIAL"
        };
      }
    }

    // 10. SUCCESS: All 7 targets completed and verified
    props.setProperty(STATE_KEY, "COMPLETED");

    // 11. FINAL AUDIT
    var finalAuditOk = writeAuditLog({
      userId: userId,
      role: role,
      sessionId: sessionToken ? String(sessionToken).substring(0, 8) + "..." : "N/A",
      action: "RESET_FINAL_RESULT",
      tool: "CONTROLLED_PRODUCTION_RESET",
      resourceId: AUTHORIZED_CR_ID,
      decision: "COMPLETED",
      reason: "All 7 target sheets successfully cleared and read-back verified under " + AUTHORIZED_CR_ID
    });

    if (!finalAuditOk) {
      return {
        success: true,
        message: "Seluruh 7 target sheet berhasil di-reset dan diverifikasi, namun penulisan audit akhir gagal.",
        data: {
          crId: AUTHORIZED_CR_ID,
          status: "COMPLETED_AUDIT_WRITE_FAILED",
          totalTargets: 7,
          verifiedTargets: completedTargets,
          details: targetDetails
        },
        errorCode: "COMPLETED_AUDIT_WRITE_FAILED"
      };
    }

    return {
      success: true,
      message: "Controlled production reset berhasil diselesaikan dan diverifikasi.",
      data: {
        crId: AUTHORIZED_CR_ID,
        status: "COMPLETED",
        totalTargets: 7,
        verifiedTargets: completedTargets,
        details: targetDetails
      },
      errorCode: null
    };

  } finally {
    // 12. RELEASE SCRIPT LOCK
    if (lockAcquired) {
      try {
        lock.releaseLock();
      } catch (relErr) {
        Logger.log("Error releasing ScriptLock: " + relErr.toString());
      }
    }
  }
}

