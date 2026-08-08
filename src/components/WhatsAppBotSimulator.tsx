import React, { useState } from 'react';
import { MessageSquare, Send, Smartphone, Bot, CheckCheck, RefreshCw } from 'lucide-react';

interface ChatMsg {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const WhatsAppBotSimulator: React.FC = () => {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      sender: 'bot',
      text: "Wa'alaikumussalam warahmatullahi wabarakatuh.\n\nSelamat datang di Layanan Digital WhatsApp RT 07 RW 11 Perum GPA Ngijo.\n\nSilakan pilih menu layanan:\n1. Administrasi Surat\n2. Informasi Warga\n3. Iuran & Keuangan\n4. Pengaduan Warga\n5. Agenda Kegiatan\n6. Hubungi Pengurus",
      time: '09:00'
    }
  ]);
  const [input, setInput] = useState('');

  const getTimeStr = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const handleSend = (textToSend?: string) => {
    const msgText = textToSend || input;
    if (!msgText.trim()) return;

    const userMsg: ChatMsg = {
      sender: 'user',
      text: msgText,
      time: getTimeStr()
    };

    let botResponseText = '';
    const cleanText = msgText.trim().toUpperCase();

    if (cleanText === 'ASSALAMUALAIKUM' || cleanText === 'HALO' || cleanText === 'PING' || cleanText === 'MENU') {
      botResponseText = "Wa'alaikumussalam warahmatullahi wabarakatuh.\n\nSelamat datang di Layanan Digital WhatsApp RT 07 RW 11 Perum GPA Ngijo.\n\nSilakan ketik nomor menu:\n1. Administrasi Surat\n2. Informasi Warga\n3. Iuran & Keuangan\n4. Pengaduan Warga\n5. Agenda Kegiatan\n6. Hubungi Pengurus";
    } else if (cleanText === '1') {
      botResponseText = "📋 *Layanan Administrasi Surat RT 07*\n\nSilakan pilih jenis surat:\n1.1 Surat Keterangan Domisili\n1.2 Surat Pengantar KTP / KK\n1.3 Surat Keterangan Usaha\n1.4 Cek Status Surat";
    } else if (cleanText === '1.1' || cleanText === '1.2' || cleanText === '1.3') {
      botResponseText = "✅ *Link Form Pengajuan Surat*\n\nSilakan isi formulir online melalui portal SMART RT:\nhttps://rt07rw11gpa.web.app/layanan\n\nNomor tiket pengajuan akan terbit setelah form dikirim.";
    } else if (cleanText === '1.4') {
      botResponseText = "🔍 *Cek Status Surat*\n\nKetik nomor surat Anda (contoh: SRT-2026-0001) untuk memeriksa status verifikasi.";
    } else if (cleanText === '2') {
      botResponseText = "ℹ️ *Informasi Warga RT 07 RW 11*\n\n- Jumlah Keluarga: 45 KK\n- Jadwal Kerja Bakti: Minggu Kedua Bulanan\n- Pos Kamling: Aktif 24 Jam\n- Portal Website: https://rt07rw11gpa.web.app";
    } else if (cleanText === '3') {
      botResponseText = "💳 *Layanan Iuran RT*\n\nNominal Iuran Kebersihan & Keamanan: Rp 50.000 / KK / Bulan.\n\nPembayaran dapat dilakukan via Scan QRIS RT atau Transfer ke Rekening RT 07 RW 11 GPA Ngijo.";
    } else if (cleanText === '4') {
      botResponseText = "🚨 *Layanan Pengaduan Warga*\n\nSilakan sampaikan keluhan Anda dengan format:\nADUAN#KATEGORI#LOKASI#DESKRIPSI\n\nAtau klik link form pengaduan:\nhttps://rt07rw11gpa.web.app/pengaduan";
    } else if (cleanText === '5') {
      botResponseText = "📅 *Agenda Mendatang RT 07*\n\n1. Kerja Bakti Umbul-Umbul HUT RI (10 Agt 06.30 WIB)\n2. Rapat Bulanan Warga (15 Agt 19.30 WIB)\n3. Malam Tirakatan 17-an (16 Agt 19.00 WIB)";
    } else if (cleanText === '6') {
      botResponseText = "📞 *Kontak Pengurus RT 07 RW 11*\n\n• Ketua RT (Bpk. Bambang): 0812-3456-7890\n• Sekretaris (Bpk. Eko): 0817-8901-2345\n• Bendahara (Ibu Anisa): 0812-3344-5566";
    } else if (cleanText.startsWith('SRT-')) {
      botResponseText = `🔍 *Status Surat ${cleanText}*\n\nStatus: *DISETUJUI & SELESAI*\nCatatan: Surat Pengantar telah ditandatangani Ketua RT 07. Silakan unduh PDF di portal.`;
    } else {
      botResponseText = "Mohon maaf, perintah tidak dikenali.\nKetik *ASSALAMUALAIKUM* atau *MENU* untuk menampilkan daftar layanan RT 07.";
    }

    const botMsg: ChatMsg = {
      sender: 'bot',
      text: botResponseText,
      time: getTimeStr()
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleQuickCommand = (cmd: string) => {
    handleSend(cmd);
  };

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-4 max-w-md mx-auto text-white">
      
      {/* Bot Top Header */}
      <div className="bg-[#123B5D] p-3 rounded-xl flex items-center justify-between border border-[#2E7D52]/40 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2E7D52] p-1 flex items-center justify-center border border-[#D4A72C]">
            <Bot className="w-6 h-6 text-[#D4A72C]" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">RT 07 RW 11 GPA (Bot Center)</h4>
            <span className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              WhatsApp Business Verified
            </span>
          </div>
        </div>
        <button
          onClick={() => setMessages([{
            sender: 'bot',
            text: "Wa'alaikumussalam... Ketik ASSALAMUALAIKUM untuk mulai.",
            time: '09:00'
          }])}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
          title="Reset Simulator"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Buttons */}
      <div className="flex flex-wrap gap-1 mb-3">
        {['ASSALAMUALAIKUM', '1', '2', '3', '4', '5', '6', 'SRT-2026-0001'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleQuickCommand(cmd)}
            className="bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-[#D4A72C] px-2 py-1 rounded-md border border-slate-700"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Chat Messages Screen */}
      <div className="bg-[#0b141a] rounded-xl p-3 h-72 overflow-y-auto space-y-3 font-sans border border-slate-800">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-2.5 text-xs whitespace-pre-wrap leading-relaxed shadow ${
                m.sender === 'user'
                  ? 'bg-[#005c4b] text-white rounded-tr-none'
                  : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700'
              }`}
            >
              {m.text}
              <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-1">
                <span>{m.time}</span>
                {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-cyan-400" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder="Ketik ASSALAMUALAIKUM atau angka menu..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2E7D52]"
        />
        <button
          onClick={() => handleSend()}
          className="bg-[#2E7D52] hover:bg-[#236340] text-white px-3 py-2 rounded-xl flex items-center justify-center shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
