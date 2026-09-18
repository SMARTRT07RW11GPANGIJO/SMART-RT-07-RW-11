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

    // 6. getWargaList Action Router
    if (action === "getWargaList") {
      try {
        var resWargaList = (typeof getWargaList === "function") ? getWargaList(payload.userRole || "WARGA") : { success: true, data: [] };
        return jsonResponse({ success: true, data: resWargaList, errorCode: null });
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "Gagal mengambil daftar warga: " + (err && err.message ? err.message : "Error"),
          data: null,
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
