// SMART RT 07 RW 11 GPA NGIJO - WHATSAPP RESPONSE FORMATTER v1.0
// Markdown Formatter, Privacy Protection, Provenance Warnings & 2-Step Confirmation Engine

import { AIAgentResponse, AIConfirmationPayload, AISourceCitation } from '../../types/aiAgent';

export class WhatsAppResponseFormatter {
  private static readonly HEADER = `*SMART RT 07 RW 11 GPA NGIJO*\n_Asisten Cerdas Warga_\n───────────────────────────`;
  private static readonly FOOTER = `───────────────────────────\n🌐 https://smart-rt07-gpa-ngijo.app\n_Bersama Melayani, Bersama Membangun._`;

  /**
   * Format full AI Agent response into a structured WhatsApp message
   */
  public static formatResponse(aiResponse: AIAgentResponse, isUnlinked: boolean = false): string {
    // 1. Unlinked public notice header if sender is not registered
    let unlinkedNotice = '';
    if (isUnlinked) {
      unlinkedNotice = `ℹ️ _Nomor WhatsApp ini belum terhubung dengan data warga resmi. Jawaban bersifat informasi umum._\n\n`;
    }

    // 2. Main response body
    let body = aiResponse.message;

    // 3. Format 2-Step Mutation Confirmation Prompt if required
    if (aiResponse.confirmationPrompt) {
      body += `\n\n${this.formatConfirmationPrompt(aiResponse.confirmationPrompt)}`;
    }

    // 4. Format Source Citations & GeoBase Warnings
    const sourcesFormatted = this.formatSources(aiResponse.sources);
    if (sourcesFormatted) {
      body += `\n\n${sourcesFormatted}`;
    }

    return `${this.HEADER}\n\n${unlinkedNotice}${body}\n\n${this.FOOTER}`;
  }

  /**
   * Format 2-Step Confirmation block for WhatsApp interactive flow
   */
  public static formatConfirmationPrompt(prompt: AIConfirmationPayload): string {
    let details = '';
    if (prompt.parameters && Object.keys(prompt.parameters).length > 0) {
      details = Object.entries(prompt.parameters)
        .map(([k, v]) => `• *${k}:* ${v}`)
        .join('\n');
    }

    return (
      `⚠️ *KONFIRMASI TINDAKAN DIPERLUKAN*\n\n` +
      `📋 *Tindakan:* ${prompt.title || prompt.toolName}\n` +
      `📝 *Keterangan:* ${prompt.description}\n` +
      (details ? `🔍 *Detail Parameter:*\n${details}\n` : '') +
      `\n💬 *Ketik "SETUJU" atau "YA" untuk memproses.*` +
      `\n❌ *Ketik "BATAL" untuk membatalkan.*`
    );
  }

  /**
   * Format Source Provenance and Layer 3 GeoBase Warnings
   */
  public static formatSources(sources?: AISourceCitation[]): string {
    if (!sources || sources.length === 0) return '';

    const lines: string[] = ['📚 *Sumber Rujukan Data:*'];
    for (const s of sources) {
      let tag = '✅ [RESMI]';
      if (s.layer === 'LAYER_3_REFERENCE_DATA' || s.verificationStatus === 'REFERENCE_UNVERIFIED') {
        tag = '⚠️ [REFERENCE — BELUM DIVERIFIKASI LAPANGAN]';
      } else if (s.layer === 'LAYER_2_OPERATIONAL_DATA') {
        tag = '🏢 [OPERASIONAL]';
      }

      lines.push(`• *${s.title}* ${tag}`);
    }

    return lines.join('\n');
  }

  /**
   * Format Safe Generic Error for WhatsApp Channel
   */
  public static formatSafeError(errorMessage?: string): string {
    return (
      `${this.HEADER}\n\n` +
      `⚠️ *Informasi Layanan*\n\n` +
      `Maaf, kami belum dapat memproses permintaan Anda saat ini.\n` +
      `${errorMessage || 'Silakan coba kembali beberapa saat lagi atau hubungi Sekretariat RT 07.'}\n\n` +
      `${this.FOOTER}`
    );
  }

  /**
   * Format Mutation Success Result
   */
  public static formatMutationSuccess(title: string, summary: string, trackingId?: string): string {
    return (
      `${this.HEADER}\n\n` +
      `✅ *${title} BERHASIL*\n\n` +
      `${summary}\n` +
      (trackingId ? `\n📌 *ID / Nomor Rujukan:* \`${trackingId}\`` : '') +
      `\n\n${this.FOOTER}`
    );
  }

  /**
   * Format Mutation Cancelled Result
   */
  public static formatMutationCancelled(reason?: string): string {
    return (
      `${this.HEADER}\n\n` +
      `🛑 *Tindakan Dibatalkan*\n\n` +
      `${reason || 'Permintaan tindakan telah dibatalkan dengan aman.'}\n\n` +
      `${this.FOOTER}`
    );
  }
}
