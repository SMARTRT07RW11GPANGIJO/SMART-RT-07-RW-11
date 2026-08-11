/**
 * SMART RT 07 RW 11 PERUM GPA NGIJO - TAHAP 8I
 * Google Apps Script - AI Tool Registry Catalog (20 Tools)
 */

function getGAS_AIToolRegistry() {
  return {
    // 1. READ TOOLS
    getMyProfile: {
      toolId: 'getMyProfile',
      category: 'READ',
      permission: 'PROFILE_SELF',
      allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'LOW',
      requiresOwnership: true,
      confirmationRequired: false,
      rateLimit: 30
    },
    getMyPayments: {
      toolId: 'getMyPayments',
      category: 'READ',
      permission: 'PAYMENT_READ_SELF',
      allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'LOW',
      requiresOwnership: true,
      confirmationRequired: false,
      rateLimit: 30
    },
    getMyLetters: {
      toolId: 'getMyLetters',
      category: 'READ',
      permission: 'LETTER_READ_SELF',
      allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'LOW',
      requiresOwnership: true,
      confirmationRequired: false,
      rateLimit: 30
    },
    getMyComplaints: {
      toolId: 'getMyComplaints',
      category: 'READ',
      permission: 'COMPLAINT_READ_SELF',
      allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'LOW',
      requiresOwnership: true,
      confirmationRequired: false,
      rateLimit: 30
    },
    getLetterStatus: {
      toolId: 'getLetterStatus',
      category: 'READ',
      permission: 'LETTER_READ_SELF',
      allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'LOW',
      requiresOwnership: true,
      confirmationRequired: false,
      rateLimit: 30
    },
    getRTAnnouncement: {
      toolId: 'getRTAnnouncement',
      category: 'READ',
      permission: 'PUBLIC_READ',
      allowedRoles: ['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'LOW',
      requiresOwnership: false,
      confirmationRequired: false,
      rateLimit: 60
    },
    getServiceRequirements: {
      toolId: 'getServiceRequirements',
      category: 'READ',
      permission: 'PUBLIC_READ',
      allowedRoles: ['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'LOW',
      requiresOwnership: false,
      confirmationRequired: false,
      rateLimit: 60
    },
    getFinancialSummary: {
      toolId: 'getFinancialSummary',
      category: 'READ',
      permission: 'FINANCE_READ',
      allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'MEDIUM',
      requiresOwnership: false,
      confirmationRequired: false,
      rateLimit: 20
    },

    // 2. TRANSACTION TOOLS
    createLetterRequest: {
      toolId: 'createLetterRequest',
      category: 'TRANSACTION',
      permission: 'LETTER_CREATE',
      allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'MEDIUM',
      requiresOwnership: true,
      confirmationRequired: true,
      rateLimit: 10
    },
    createComplaint: {
      toolId: 'createComplaint',
      category: 'TRANSACTION',
      permission: 'COMPLAINT_CREATE',
      allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'MEDIUM',
      requiresOwnership: true,
      confirmationRequired: true,
      rateLimit: 10
    },
    submitPaymentConfirmation: {
      toolId: 'submitPaymentConfirmation',
      category: 'TRANSACTION',
      permission: 'PAYMENT_READ_SELF',
      allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'MEDIUM',
      requiresOwnership: true,
      confirmationRequired: true,
      rateLimit: 10
    },

    // 3. DOCUMENT TOOLS
    generateLetterPDF: {
      toolId: 'generateLetterPDF',
      category: 'DOCUMENT',
      permission: 'PDF_GENERATE',
      allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'LOW',
      requiresOwnership: true,
      confirmationRequired: false,
      rateLimit: 20
    },
    generatePaymentReceipt: {
      toolId: 'generatePaymentReceipt',
      category: 'DOCUMENT',
      permission: 'PAYMENT_READ_SELF',
      allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'LOW',
      requiresOwnership: true,
      confirmationRequired: false,
      rateLimit: 20
    },
    verifyDocumentQR: {
      toolId: 'verifyDocumentQR',
      category: 'DOCUMENT',
      permission: 'QR_VERIFY',
      allowedRoles: ['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'LOW',
      requiresOwnership: false,
      confirmationRequired: false,
      rateLimit: 60
    },

    // 4. COMMUNICATION TOOLS
    sendWhatsAppMessage: {
      toolId: 'sendWhatsAppMessage',
      category: 'COMMUNICATION',
      permission: 'AI_CHAT',
      allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'HIGH',
      requiresOwnership: false,
      confirmationRequired: true,
      rateLimit: 10
    },
    sendLetterNotification: {
      toolId: 'sendLetterNotification',
      category: 'COMMUNICATION',
      permission: 'LETTER_VERIFY',
      allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'MEDIUM',
      requiresOwnership: false,
      confirmationRequired: true,
      rateLimit: 15
    },
    sendPaymentReminder: {
      toolId: 'sendPaymentReminder',
      category: 'COMMUNICATION',
      permission: 'FINANCE_MANAGE',
      allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'HIGH',
      requiresOwnership: false,
      confirmationRequired: true,
      rateLimit: 10
    },
    sendComplaintUpdate: {
      toolId: 'sendComplaintUpdate',
      category: 'COMMUNICATION',
      permission: 'COMPLAINT_MANAGE',
      allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'MEDIUM',
      requiresOwnership: false,
      confirmationRequired: true,
      rateLimit: 15
    },

    // 5. ADMIN TOOLS
    createAnnouncement: {
      toolId: 'createAnnouncement',
      category: 'ADMIN',
      permission: 'ANNOUNCEMENT_PUBLISH',
      allowedRoles: ['KETUA_RT', 'ADMIN'],
      riskLevel: 'HIGH',
      requiresOwnership: false,
      confirmationRequired: true,
      rateLimit: 5
    },
    approveLetter: {
      toolId: 'approveLetter',
      category: 'ADMIN',
      permission: 'LETTER_APPROVE',
      allowedRoles: ['KETUA_RT', 'ADMIN'],
      riskLevel: 'HIGH',
      requiresOwnership: false,
      confirmationRequired: true,
      rateLimit: 10
    },
    updateComplaintStatus: {
      toolId: 'updateComplaintStatus',
      category: 'ADMIN',
      permission: 'COMPLAINT_MANAGE',
      allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
      riskLevel: 'HIGH',
      requiresOwnership: false,
      confirmationRequired: true,
      rateLimit: 15
    },
    generateFinancialReport: {
      toolId: 'generateFinancialReport',
      category: 'ADMIN',
      permission: 'FINANCE_MANAGE',
      allowedRoles: ['KETUA_RT', 'ADMIN'],
      riskLevel: 'CRITICAL',
      requiresOwnership: false,
      confirmationRequired: true,
      rateLimit: 5
    }
  };
}
