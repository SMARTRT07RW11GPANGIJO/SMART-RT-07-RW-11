import React from 'react';
import { Conversation } from '../../types/ai';
import { Plus, MessageSquare, Trash2, Bot, Clock } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation
}) => {
  return (
    <div className="flex flex-col h-full bg-[#0D2A4A] text-white border-r border-[#0D2A4A]/20">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2E7D52] flex items-center justify-center text-white border border-[#C89A2B]">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white leading-tight">RITA AI Chat</h3>
            <p className="text-[10px] text-slate-300">Riwayat Percakapan RT 07</p>
          </div>
        </div>

        <button
          onClick={onNewConversation}
          className="w-full bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 border border-[#C89A2B]/40 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Percakapan Baru</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-xs italic">
            Belum ada riwayat percakapan. Klik "Percakapan Baru" untuk memulai.
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const lastMsg = conv.messages[conv.messages.length - 1];

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#2E7D52] text-white shadow-md font-semibold border border-[#C89A2B]/50'
                    : 'hover:bg-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-start gap-2.5 overflow-hidden pr-6">
                  <MessageSquare className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-[#C89A2B]' : 'text-slate-400'}`} />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate leading-tight">
                      {conv.title || 'Percakapan Baru'}
                    </p>
                    <p className="text-[10px] opacity-80 truncate mt-0.5">
                      {lastMsg ? lastMsg.content : 'Belum ada pesan'}
                    </p>
                    <span className="flex items-center gap-1 text-[9px] opacity-60 mt-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(conv.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Apakah Anda yakin ingin menghapus percakapan ini?')) {
                      onDeleteConversation(conv.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-300 p-1 rounded-lg transition-opacity"
                  title="Hapus Percakapan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Branding */}
      <div className="p-3 border-t border-white/10 text-center text-[10px] text-slate-400">
        SMART RT 07 RW 11 GPA Ngijo
      </div>
    </div>
  );
};
