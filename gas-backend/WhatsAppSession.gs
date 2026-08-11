/**
 * WhatsAppSession.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8H — WHATSAPP SESSION STATE ENGINE
 * 
 * Manages conversational session state & pending confirmation steps.
 * States: START, SELECT_SERVICE, COLLECT_DATA, VALIDATE, CONFIRM, SUBMIT, COMPLETED, CANCELLED
 */

var WA_SESSION_STORE = {};

var WA_SESSION_STATES = {
  START: 'START',
  SELECT_SERVICE: 'SELECT_SERVICE',
  COLLECT_DATA: 'COLLECT_DATA',
  VALIDATE: 'VALIDATE',
  CONFIRM: 'CONFIRM',
  SUBMIT: 'SUBMIT',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

function getOrCreateWASession(phone, residentId) {
  var now = Date.now();
  var session = WA_SESSION_STORE[phone];

  if (!session || now > session.expiresAt || session.status === 'EXPIRED') {
    session = {
      sessionId: "WASEX-" + now + "-" + Math.floor(Math.random() * 1000),
      phone: phone,
      residentId: residentId || "ANONYMOUS",
      conversationId: "WACONV-" + now,
      state: WA_SESSION_STATES.START,
      pendingAction: null,
      lastActivity: new Date().toISOString(),
      expiresAt: now + (30 * 60 * 1000), // 30 mins expiry
      status: 'ACTIVE'
    };
    WA_SESSION_STORE[phone] = session;
  } else {
    session.lastActivity = new Date().toISOString();
    session.expiresAt = now + (30 * 60 * 1000);
  }

  return session;
}

function setWASessionPendingAction(phone, actionPayload) {
  var session = getOrCreateWASession(phone);
  session.state = WA_SESSION_STATES.CONFIRM;
  session.pendingAction = actionPayload;
  WA_SESSION_STORE[phone] = session;
}

function clearWASessionPendingAction(phone) {
  var session = getOrCreateWASession(phone);
  session.state = WA_SESSION_STATES.START;
  session.pendingAction = null;
  WA_SESSION_STORE[phone] = session;
}
