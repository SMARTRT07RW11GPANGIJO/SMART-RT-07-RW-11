import React from 'react';
import { ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';

interface ChatActionsProps {
  messageId: string;
  content: string;
  feedback?: 'HELPFUL' | 'UNHELPFUL';
  onFeedback: (msgId: string, type: 'HELPFUL' | 'UNHELPFUL') => void;
}

export const ChatActions: React.FC<ChatActionsProps> = ({
  messageId,
  content,
  feedback,
  onFeedback
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="hover:text-[#0D2A4A] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100"
          title="Salin Pesan"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-600" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          <span>{copied ? 'Tersalin' : 'Salin'}</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-medium text-slate-500 mr-0.5">Apakah jawaban ini membantu?</span>
        
        <button
          onClick={() => onFeedback(messageId, 'HELPFUL')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
            feedback === 'HELPFUL'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
              : 'border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-slate-600'
          }`}
          title="Membantu"
        >
          <ThumbsUp className="w-3 h-3" />
          <span>👍 Membantu</span>
        </button>

        <button
          onClick={() => onFeedback(messageId, 'UNHELPFUL')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
            feedback === 'UNHELPFUL'
              ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
              : 'border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600'
          }`}
          title="Tidak membantu"
        >
          <ThumbsDown className="w-3 h-3" />
          <span>👎 Tidak membantu</span>
        </button>
      </div>
    </div>
  );
};
