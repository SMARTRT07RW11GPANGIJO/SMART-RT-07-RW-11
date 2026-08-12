# 10 — WHATSAPP DOCUMENTATION

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-10-WHATSAPP` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## 1. Overview & Service Gateway

- **Provider**: WhatsApp Webhook & API Gateway (`whatsappService.ts`)
- **Backend Handler**: `WhatsAppRouter.gs`, `WhatsAppWebhook.gs`, `WhatsAppSender.gs`
- **Purpose**: Automatic delivery of fee payment receipts, digital letter approval notifications, security emergency alerts, and resident reminders.

---

## 2. Message Dispatch Architecture

```text
Application Event (e.g. Fee Payment Approved)
                    │
                    ▼
Format WhatsApp Message Template
                    │
                    ▼
Check Rate Limits & Recipient Phone Number
                    │
                    ▼
Submit Payload to Gateway API (Bearer Token Authorized)
                    │
                    ▼
Gateway Delivers Message to Recipient
                    │
                    ▼
Webhook Receives Status Callback (SENT / DELIVERED / READ)
```

---

## 3. Rate Limiting & Failover Protocol

- **Rate Limit**: Maximum 30 messages per minute.
- **Exponential Backoff Retry**: If gateway returns timeout or HTTP 5xx error:
  - Retry 1: After 2 seconds
  - Retry 2: After 8 seconds
  - Retry 3: After 32 seconds
- **Fallback Channel**: If WhatsApp gateway remains offline after 3 retries, system queues notification for in-app dashboard display and logs alert to Control Center.

---

## 4. WhatsApp Troubleshooting Matrix

| Symptom | Cause | Diagnostic Action | Solution |
| :--- | :--- | :--- | :--- |
| **Pesan Gagal Terkirim** | Invalid Token or Gateway Down | Check `WHATSAPP_API_TOKEN` in environment variables | Re-issue gateway bearer token |
| **Delay > 5000ms** | Gateway Queue Backlog | Monitor Control Center WhatsApp status badge | Wait for queue flush or increase worker rate |
| **Nomor Tidak Terdaftar** | Format phone number error | Verify number starts with country code `62` | Format phone string using `628xxxxxxxx` |
