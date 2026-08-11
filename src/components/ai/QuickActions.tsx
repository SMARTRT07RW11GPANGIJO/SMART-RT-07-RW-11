import React from 'react';
import { QuickActionItem } from '../../types/ai';

interface QuickActionsProps {
  actions: QuickActionItem[];
  onSelectAction: (query: string) => void;
  disabled?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  onSelectAction,
  disabled = false
}) => {
  return (
    <div className="flex flex-wrap gap-2 py-2">
      {actions.map((act) => (
        <button
          key={act.id}
          onClick={() => onSelectAction(act.query)}
          disabled={disabled}
          className="bg-white hover:bg-[#0D2A4A] text-[#0D2A4A] hover:text-[#E9D8B4] border border-[#0D2A4A]/20 hover:border-[#C89A2B] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{act.label}</span>
        </button>
      ))}
    </div>
  );
};
