/**
 * WhatsAppIdentity.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8H — WHATSAPP IDENTITY LINKING & AUTH
 * 
 * Links WhatsApp Phone Number with Resident Account using Pairing Code / OTP.
 * Never uses NIK as password.
 */

var WA_IDENTITY_MAP = {
  "6281234567890": { residentId: "WRG-001", name: "Bambang Susilo", role: "WARGA", linked: true },
  "6281298765432": { residentId: "PGR-002", name: "Ahmad Subagyo", role: "PENGURUS", linked: true },
  "6281333444555": { residentId: "RT07-001", name: "Sutrisno, M.P.", role: "KETUA_RT", linked: true }
};

var PENDING_PAIRING_CODES = {
  "RT07-482931": { residentId: "WRG-005", name: "Dwi Cahyono", role: "WARGA", expiresAt: Date.now() + 86400000 }
};

/**
 * Lookup Identity by WhatsApp Number
 */
function getWAIdentityByPhone(phone) {
  var cleanPhone = phone.replace(/[^0-9]/g, "");
  if (cleanPhone.indexOf("08") === 0) cleanPhone = "62" + cleanPhone.substring(1);

  var account = WA_IDENTITY_MAP[cleanPhone];
  if (account && account.linked) {
    return {
      isLinked: true,
      residentId: account.residentId,
      name: account.name,
      role: account.role || "WARGA",
      phone: cleanPhone
    };
  }

  return {
    isLinked: false,
    phone: cleanPhone,
    role: "PUBLIC"
  };
}

/**
 * Generate Pairing Code for Portal
 */
function generateWAPairingCode(residentId, name, role) {
  var randomDigits = Math.floor(100000 + Math.random() * 900000);
  var code = "RT07-" + randomDigits;
  PENDING_PAIRING_CODES[code] = {
    residentId: residentId,
    name: name,
    role: role || "WARGA",
    expiresAt: Date.now() + (24 * 3600 * 1000)
  };
  return code;
}

/**
 * Process Pairing Registration from WA message (e.g. "DAFTAR RT07-482931")
 */
function processWAPairing(phone, code) {
  var cleanPhone = phone.replace(/[^0-9]/g, "");
  var pairing = PENDING_PAIRING_CODES[code.toUpperCase()];

  if (!pairing) {
    return {
      success: false,
      message: "⚠️ Kode pairing *" + code + "* tidak valid atau telah kadaluarsa. Silakan ambil kode baru di Portal Web SMART RT."
    };
  }

  if (Date.now() > pairing.expiresAt) {
    delete PENDING_PAIRING_CODES[code.toUpperCase()];
    return {
      success: false,
      message: "⚠️ Kode pairing *" + code + "* telah kadaluarsa. Silakan minta kode baru di Portal."
    };
  }

  // Link account
  WA_IDENTITY_MAP[cleanPhone] = {
    residentId: pairing.residentId,
    name: pairing.name,
    role: pairing.role,
    linked: true
  };

  delete PENDING_PAIRING_CODES[code.toUpperCase()];

  return {
    success: true,
    residentId: pairing.residentId,
    name: pairing.name,
    role: pairing.role,
    message: "🎉 *PENAUTAN AKUN WA BERHASIL!*\n\nSelamat datang Bpk/Ibu *" + pairing.name + "* (" + pairing.role + "). Nomor WA Anda (" + cleanPhone + ") telah terhubung secara aman dengan akun Portal RT 07 RW 11."
  };
}
