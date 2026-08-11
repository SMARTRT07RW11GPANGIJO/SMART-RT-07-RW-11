import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  maxLength = 4000
}) => {
  const [text, setText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled || trimmed.length > maxLength) return;

    onSendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // Auto grow height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const isOverLimit = charCount > maxLength;

  return (
    <div className="p-3 bg-white border-t border-slate-200">
      <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
        
        <div className="relative flex items-end bg-slate-50 border border-slate-300 rounded-2xl focus-within:ring-2 focus-within:ring-[#0D2A4A] focus-within:bg-white transition-all p-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ketik pertanyaan Anda (SOP, Surat, Iuran, Pengaduan, dll)..."
            className="w-full bg-transparent outline-none text-xs text-slate-800 placeholder-slate-400 resize-none max-h-32 px-1 py-1"
          />

          <button
            type="submit"
            disabled={!text.trim() || disabled || isOverLimit}
            className="bg-[#2E7D52] hover:bg-[#236340] disabled:bg-slate-300 text-white p-2 rounded-xl transition-all shadow shrink-0 ml-2 active:scale-95 disabled:cursor-not-allowed"
            title="Kirim Pesan (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Counter and Error Limit */}
        <div className="flex items-center justify-between text-[10px] px-1 text-slate-400">
          <span className="flex items-center gap-1">
            Tekan <kbd className="bg-slate-100 border border-slate-300 px-1 rounded text-[9px] font-mono">Enter</kbd> untuk mengirim, <kbd className="bg-slate-100 border border-slate-300 px-1 rounded text-[9px] font-mono">Shift+Enter</kbd> baris baru
          </span>

          <span className={`font-mono font-medium ${isOverLimit ? 'text-rose-600 font-bold' : ''}`}>
            {charCount}/{maxLength}
          </span>
        </div>

        {isOverLimit && (
          <div className="flex items-center gap-1 text-[10px] text-rose-600 font-bold px-1">
            <AlertCircle className="w-3 h-3" />
            <span>Pesan melebihi batas maksimum 4000 karakter.</span>
          </div>
        )}

      </form>
    </div>
  );
};
